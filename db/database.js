import { Platform } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

let db = null;
if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabaseSync('despensa.db');
}

/* ---------- INIT ---------- */

export const initDB = async () => {
  if (!db) return;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#1e90ff'
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      minStock INTEGER DEFAULT 1,
      barcode TEXT,
      expirationDate TEXT,
      categoryId TEXT NOT NULL
    );
  `);
};

/* ---------- UTILS ---------- */

const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

/* ---------- CATEGORIES ---------- */

export const fetchCategories = async () => {
  if (!db) return [];
  return await db.getAllAsync('SELECT * FROM categories ORDER BY name;');
};

export const fetchCategoriesWithLowStockCount = async () => {
  if (!db) return [];
  return await db.getAllAsync(`
    SELECT 
      categories.*,
      COUNT(items.id) as lowStockCount
    FROM categories
    LEFT JOIN items 
      ON items.categoryId = categories.id 
      AND items.quantity <= items.minStock
    GROUP BY categories.id
    ORDER BY categories.name;
  `);
};

export const insertCategory = async (id, name, color = '#1e90ff') => {
  if (!db) return;

  const clean = name.trim().toLowerCase();
  const exists = await db.getAllAsync(
    'SELECT * FROM categories WHERE LOWER(name) = ?;',
    [clean]
  );

  if (exists.length > 0) throw new Error('CATEGORY_EXISTS');

  await db.runAsync(
    'INSERT INTO categories (id, name, color) VALUES (?, ?, ?);',
    [id, name.trim(), color]
  );
};

export const updateCategory = async (id, name, color) => {
  if (!db) return;
  await db.runAsync(
    'UPDATE categories SET name = ?, color = ? WHERE id = ?;',
    [name.trim(), color, id]
  );
};

export const deleteCategoryWithItems = async (id) => {
  if (!db) return;
  await db.runAsync('DELETE FROM items WHERE categoryId = ?;', [id]);
  await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
};

/* ---------- ITEMS ---------- */
export const fetchAllItems = async () => {
  const result = await db.getAllAsync('SELECT * FROM items');
  return result || [];
};


export const fetchItemsByCategory = async (categoryId) => {
  if (!db) return [];
  return await db.getAllAsync(
    'SELECT * FROM items WHERE categoryId = ? ORDER BY name;',
    [categoryId]
  );
};

export const insertItem = async ({
  name,
  quantity = 0,
  minStock = 1,
  barcode = null,
  expirationDate = null,
  categoryId,
}) => {
  if (!name || !categoryId) {
    throw new Error('insertItem: datos incompletos');
  }

  const id = genId();

  await db.runAsync(
    `INSERT INTO items 
     (id, name, quantity, minStock, barcode, expirationDate, categoryId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      name.trim(),
      Number(quantity),
      Number(minStock),
      barcode,
      expirationDate,
      categoryId,
    ]
  );

  return { id };
};

export const updateItem = async (item) => {
  const { id, name, quantity, minStock, barcode, expirationDate } = item;
  await db.runAsync(
    `
    UPDATE items
    SET name=?, quantity=?, minStock=?, barcode=?, expirationDate=?
    WHERE id=?;
    `,
    [name, quantity, minStock, barcode, expirationDate, id]
  );
};

export const deleteItem = async (id) => {
  await db.runAsync('DELETE FROM items WHERE id = ?;', [id]);
};

export const updateItemQuantity = async (id, delta) => {
  await db.runAsync(
    'UPDATE items SET quantity = quantity + ? WHERE id = ?;',
    [delta, id]
  );
};

export const fetchItemByBarcode = async (barcode) => {
  const result = await db.getAllAsync(
    'SELECT * FROM items WHERE barcode = ?;',
    [barcode]
  );
  return result[0];
};

export const fetchLowStockItems = async () => {
  return await db.getAllAsync(
    'SELECT * FROM items WHERE quantity <= minStock;'
  );
};

export const fetchLowStockItemsWithCategory = async () => {
  return await db.getAllAsync(`
    SELECT items.*, categories.name as categoryName, categories.color as categoryColor
    FROM items
    LEFT JOIN categories ON items.categoryId = categories.id
    WHERE items.quantity <= items.minStock;
  `);
};

export const fetchTotalItemsCount = async () => {
  const result = await db.getAllAsync(
    'SELECT COUNT(*) as total FROM items;'
  );
  return result[0]?.total || 0;
};

/* ---------- 🔥 FIREBASE → SQLITE SYNC (LOGIN IMPORT) ---------- */

export const syncFromFirebase = async (uid) => {
  if (!uid || !db) return;

  const dbRemote = getDatabase();
  const snap = await get(ref(dbRemote, `users/${uid}/categories`));
  const categories = snap.val();
  if (!categories) return;

  // 🔥 Hard reset local DB (authoritative cloud source)
  await db.runAsync('DELETE FROM items;');
  await db.runAsync('DELETE FROM categories;');

  for (const [catId, cat] of Object.entries(categories)) {
    await db.runAsync(
      'INSERT INTO categories (id, name, color) VALUES (?, ?, ?);',
      [catId, cat.name, cat.color]
    );

    if (cat.items) {
      for (const [itemId, item] of Object.entries(cat.items)) {
        await db.runAsync(
          `INSERT INTO items 
           (id, name, quantity, minStock, barcode, expirationDate, categoryId)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            itemId,
            item.name,
            item.quantity ?? 0,
            item.minStock ?? 1,
            item.barcode ?? null,
            item.expirationDate ?? null,
            catId,
          ]
        );
      }
    }
  }
};

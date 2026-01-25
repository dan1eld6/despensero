import { Platform } from 'react-native';

let db = null;
if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabaseSync('despensa.db');
}

export const initDB = async () => {
  if (!db) return;

  /* ---------- CREATE TABLES ---------- */

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#1e90ff'
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      minStock INTEGER DEFAULT 1,
      barcode TEXT,
      expirationDate TEXT,
      categoryId INTEGER,
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    );
  `);

  /* ---------- MIGRATIONS ---------- */

  // 👉 Agregar columna color si la DB fue creada antes
  const cols = await db.getAllAsync(`PRAGMA table_info(categories);`);
  const hasColor = cols.some(c => c.name === 'color');

  if (!hasColor) {
    await db.execAsync(`ALTER TABLE categories ADD COLUMN color TEXT DEFAULT '#1e90ff';`);
  }
};

/* ---------- CATEGORIES ---------- */

export const fetchCategories = async () => {
  if (!db) return [];
  return await db.getAllAsync('SELECT * FROM categories;');
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
    GROUP BY categories.id;
  `);
};

export const insertCategory = async (name, color = '#1e90ff') => {
  if (!db) return;
  await db.runAsync(
    'INSERT INTO categories (name, color) VALUES (?, ?);',
    [name, color]
  );
};

export const updateCategory = async (id, name, color) => {
  if (!db) return;
  await db.runAsync(
    'UPDATE categories SET name = ?, color = ? WHERE id = ?;',
    [name, color, id]
  );
};

export const deleteCategoryWithItems = async (id) => {
  if (!db) return;
  await db.runAsync('DELETE FROM items WHERE categoryId = ?;', [id]);
  await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
};

/* ---------- ITEMS ---------- */

export const fetchItemsByCategory = async (categoryId) => {
  if (!db) return [];
  return await db.getAllAsync(
    'SELECT * FROM items WHERE categoryId = ?;',
    [categoryId]
  );
};

export const insertItem = async (item) => {
  const {
    name,
    quantity = 0,
    minStock = 1,
    barcode = null,
    expirationDate = null,
    categoryId,
  } = item;

  if (!name || !categoryId) {
    throw new Error('insertItem: datos incompletos');
  }

  await db.runAsync(
    'INSERT INTO items (name, quantity, minStock, barcode, expirationDate, categoryId) VALUES (?, ?, ?, ?, ?, ?);',
    [name, Number(quantity), Number(minStock), barcode, expirationDate, Number(categoryId)]
  );
};

export const updateItem = async (item) => {
  const { id, name, quantity, minStock, barcode, expirationDate } = item;
  await db.runAsync(
    'UPDATE items SET name=?, quantity=?, minStock=?, barcode=?, expirationDate=? WHERE id=?;',
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

/* ---------- EXPIRATION ---------- */

export const fetchExpiredItems = async () => {
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync(
    'SELECT * FROM items WHERE expirationDate IS NOT NULL AND expirationDate < ?;',
    [today]
  );
};

export const fetchExpiringSoonItems = async (days = 7) => {
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + days);

  const from = today.toISOString().split('T')[0];
  const to = future.toISOString().split('T')[0];

  return await db.getAllAsync(
    'SELECT * FROM items WHERE expirationDate BETWEEN ? AND ?;',
    [from, to]
  );
};

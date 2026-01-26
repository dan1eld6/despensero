import { ref, set, get } from 'firebase/database';
import { db as rtdb } from '../firebase/firebase';
import {
  fetchCategories,
  fetchItemsByCategory,
  insertCategory,
  insertItem,
} from '../db/database';

/* ================================
   SUBIR TODO SQLITE → FIREBASE
================================ */

export const pushAllLocalDataToCloud = async (uid) => {
  const categories = await fetchCategories();

  const payload = {
    categories: {},
    items: {},
  };

  for (const cat of categories) {
    payload.categories[cat.id] = cat;

    const items = await fetchItemsByCategory(cat.id);
    items.forEach((item) => {
      payload.items[item.id] = item;
    });
  }

  await set(ref(rtdb, `users/${uid}`), payload);
};

/* ================================
   BAJAR TODO FIREBASE → SQLITE
================================ */

export const pullAllCloudDataToLocal = async (uid) => {
  const snap = await get(ref(rtdb, `users/${uid}`));
  if (!snap.exists()) return;

  const { categories = {}, items = {} } = snap.val();

  for (const cat of Object.values(categories)) {
    await insertCategory(cat.name, cat.color);
  }

  for (const item of Object.values(items)) {
    await insertItem(item);
  }
};

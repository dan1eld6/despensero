import { ref, push, set, update, remove, onValue, get } from 'firebase/database';
import { db } from '../firebase/firebase';

/* ---------- CATEGORIES ---------- */

export const createCategoryCloud = async (uid, data) => {
    const newRef = push(ref(db, `users/${uid}/categories`));
    await set(newRef, {
        ...data,
        createdAt: Date.now(),
    });
    return newRef.key;
};

export const updateCategoryCloud = (uid, id, data) =>
    update(ref(db, `users/${uid}/categories/${id}`), data);

export const deleteCategoryCloud = (uid, id) =>
    remove(ref(db, `users/${uid}/categories/${id}`));

export const listenCategoriesCloud = (uid, callback) =>
    onValue(ref(db, `users/${uid}/categories`), snap =>
        callback(snap.val() ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })) : [])
    );

/* ---------- ITEMS ---------- */

export const createItemCloud = async (uid, data) => {
    const newRef = push(ref(db, `users/${uid}/items`));
    await set(newRef, {
        ...data,
        createdAt: Date.now(),
    });
    return newRef.key;
};

export const updateItemCloud = (uid, id, data) =>
    update(ref(db, `users/${uid}/items/${id}`), data);

export const deleteItemCloud = (uid, id) =>
    remove(ref(db, `users/${uid}/items/${id}`));

export const listenItemsCloud = (uid, callback) =>
    onValue(ref(db, `users/${uid}/items`), snap =>
        callback(snap.val() ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })) : [])
    );

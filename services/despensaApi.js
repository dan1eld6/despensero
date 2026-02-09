import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, remove, get } from 'firebase/database';

const getUid = () => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');
  return uid;
};

export const despensaApi = createApi({
  reducerPath: 'despensaApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Categories', 'Items'],
  endpoints: (builder) => ({
    /* ---------- CATEGORIES ---------- */

    getCategories: builder.query({
      async queryFn() {
        try {
          const uid = getUid();
          const db = getDatabase();
          const snap = await get(ref(db, `users/${uid}/categories`));
          return { data: snap.val() || {} };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      providesTags: ['Categories'],
    }),

    pushCategory: builder.mutation({
      async queryFn({ id, ...data }) {
        try {
          const uid = getUid();
          const db = getDatabase();
          await set(ref(db, `users/${uid}/categories/${id}`), {
            ...data,
            items: data.items || null,
          });
          return { data: true };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      invalidatesTags: ['Categories'],
    }),

    deleteCategoryRemote: builder.mutation({
      async queryFn(id) {
        try {
          if (!id || typeof id !== 'string') throw new Error('ID inválido');
          const uid = getUid();
          const db = getDatabase();
          await remove(ref(db, `users/${uid}/categories/${id}`));
          return { data: true };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      invalidatesTags: ['Categories'],
    }),

    /* ---------- ITEMS ---------- */

    getItemsByCategory: builder.query({
      async queryFn(categoryId) {
        try {
          const uid = getUid();
          const db = getDatabase();
          const snap = await get(
            ref(db, `users/${uid}/categories/${categoryId}/items`)
          );
          return { data: snap.val() || {} };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      providesTags: ['Items'],
    }),

    pushItem: builder.mutation({
      async queryFn({ categoryId, id, ...data }) {
        try {
          if (!categoryId || !id) throw new Error('Datos incompletos');
          const uid = getUid();
          const db = getDatabase();
          await set(
            ref(db, `users/${uid}/categories/${categoryId}/items/${id}`),
            data
          );
          return { data: true };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      invalidatesTags: ['Items'],
    }),

    deleteItemRemote: builder.mutation({
      async queryFn({ categoryId, id }) {
        try {
          if (!categoryId || !id) throw new Error('Datos incompletos');
          const uid = getUid();
          const db = getDatabase();
          await remove(
            ref(db, `users/${uid}/categories/${categoryId}/items/${id}`)
          );
          return { data: true };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      invalidatesTags: ['Items'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  usePushCategoryMutation,
  useDeleteCategoryRemoteMutation,
  useGetItemsByCategoryQuery,
  usePushItemMutation,
  useDeleteItemRemoteMutation,
} = despensaApi;

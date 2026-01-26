import { createApi } from '@reduxjs/toolkit/query/react';
import { firebaseBaseQuery } from './firebaseBaseQuery';

export const despensaApi = createApi({
  reducerPath: 'api',
  baseQuery: firebaseBaseQuery({
    baseUrl: 'https://despensero-e5e41-default-rtdb.firebaseio.com/',
  }),
  tagTypes: ['Categories', 'Items'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (uid) => `users/${uid}/categories`,
      transformResponse: (r) => r || {},
      providesTags: ['Categories'],
    }),

    pushCategory: builder.mutation({
      query: ({ uid, id, ...data }) => ({
        url: `users/${uid}/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    deleteCategoryRemote: builder.mutation({
      query: ({ uid, id }) => ({
        url: `users/${uid}/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    getItems: builder.query({
      query: (uid) => `users/${uid}/items`,
      transformResponse: (r) => r || {},
      providesTags: ['Items'],
    }),

    pushItem: builder.mutation({
      query: ({ uid, id, ...data }) => ({
        url: `users/${uid}/items/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Items'],
    }),

    deleteItemRemote: builder.mutation({
      query: ({ uid, id }) => ({
        url: `users/${uid}/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Items'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  usePushCategoryMutation,
  useDeleteCategoryRemoteMutation,
  useGetItemsQuery,
  usePushItemMutation,
  useDeleteItemRemoteMutation,
} = despensaApi;

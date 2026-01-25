import { createApi } from '@reduxjs/toolkit/query/react';
import { firebaseBaseQuery } from './firebaseApi';

export const despensaApi = createApi({
    reducerPath: 'despensaApi',
    baseQuery: firebaseBaseQuery(),
    tagTypes: ['Categories', 'Items'],
    endpoints: builder => ({
        /* ---------- CATEGORIES ---------- */

        getCategories: builder.query({
            query: () => ({ path: 'categories', method: 'GET' }),
            providesTags: ['Categories'],
        }),

        addCategory: builder.mutation({
            query: data => ({ path: 'categories', method: 'POST', body: data }),
            invalidatesTags: ['Categories'],
        }),

        updateCategory: builder.mutation({
            query: ({ id, data }) => ({
                path: 'categories',
                method: 'PATCH',
                body: { id, data },
            }),
            invalidatesTags: ['Categories'],
        }),

        deleteCategory: builder.mutation({
            query: id => ({
                path: 'categories',
                method: 'DELETE',
                body: { id },
            }),
            invalidatesTags: ['Categories'],
        }),

        /* ---------- ITEMS ---------- */

        getItems: builder.query({
            query: () => ({ path: 'items', method: 'GET' }),
            providesTags: ['Items'],
        }),

        addItem: builder.mutation({
            query: data => ({ path: 'items', method: 'POST', body: data }),
            invalidatesTags: ['Items'],
        }),

        updateItem: builder.mutation({
            query: ({ id, data }) => ({
                path: 'items',
                method: 'PATCH',
                body: { id, data },
            }),
            invalidatesTags: ['Items'],
        }),

        deleteItem: builder.mutation({
            query: id => ({
                path: 'items',
                method: 'DELETE',
                body: { id },
            }),
            invalidatesTags: ['Items'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useAddCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useGetItemsQuery,
    useAddItemMutation,
    useUpdateItemMutation,
    useDeleteItemMutation,
} = despensaApi;

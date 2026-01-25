import { createApi } from '@reduxjs/toolkit/query/react';
import { firebaseBaseQuery } from './firebaseApi'; // tu base query que definiste

export const despensaApi = createApi({
  reducerPath: 'api', // 🟢 debe coincidir con state.api
  baseQuery: firebaseBaseQuery({
    baseUrl: 'https://despensero-e5e41-default-rtdb.firebaseio.com/'
  }),
  tagTypes: ['Categories', 'Items'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => `categories.json`,
      transformResponse: (response) => response || {},
      providesTags: ['Categories'],
    }),
    addCategory: builder.mutation({
      query: (category) => ({
        url: `categories.json`,
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Categories'],
    }),
    // ... agrega endpoints de Items, expirados, etc
  }),
});

export const { useGetCategoriesQuery, useAddCategoryMutation } = despensaApi;

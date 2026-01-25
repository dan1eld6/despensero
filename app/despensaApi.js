import { createApi } from '@reduxjs/toolkit/query/react';
import { firebaseBaseQuery } from './firebaseApi';

export const despensaApi = createApi({
    reducerPath: 'api',
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

    }),
});

export const { useGetCategoriesQuery, useAddCategoryMutation } = despensaApi;

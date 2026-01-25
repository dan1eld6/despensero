import { api } from './api';

export const firebaseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    pushCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `categories/${id}.json`,
        method: 'PUT',
        body: data,
      }),
    }),

    deleteCategoryRemote: builder.mutation({
      query: (id) => ({
        url: `categories/${id}.json`,
        method: 'DELETE',
      }),
    }),

    pushItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `items/${id}.json`,
        method: 'PUT',
        body: data,
      }),
    }),

    deleteItemRemote: builder.mutation({
      query: (id) => ({
        url: `items/${id}.json`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  usePushCategoryMutation,
  useDeleteCategoryRemoteMutation,
  usePushItemMutation,
  useDeleteItemRemoteMutation,
} = firebaseApi;

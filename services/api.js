import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://despensero-e5e41-default-rtdb.firebaseio.com/',
  }),
  tagTypes: ['Categories', 'Items'],
  endpoints: () => ({}),
});

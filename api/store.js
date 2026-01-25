import { configureStore } from '@reduxjs/toolkit';
import { despensaApi } from '../services/despensaApi';

export const store = configureStore({
    reducer: {
        [despensaApi.reducerPath]: despensaApi.reducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(despensaApi.middleware),
});

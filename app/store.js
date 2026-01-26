import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { despensaApi } from '../services/despensaApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [despensaApi.reducerPath]: despensaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(despensaApi.middleware),
});

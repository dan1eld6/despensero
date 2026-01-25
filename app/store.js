import { configureStore } from '@reduxjs/toolkit';
import { despensaApi } from './despensaApi';
import authReducer from './authSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    [despensaApi.reducerPath]: despensaApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(despensaApi.middleware),
});

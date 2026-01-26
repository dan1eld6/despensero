import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../firebase/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  pushAllLocalDataToCloud,
  pullAllCloudDataToLocal,
} from '../services/cloudSync';

/* ---------- REGISTER ---------- */
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = { uid: cred.user.uid, email: cred.user.email };

      await pushAllLocalDataToCloud(user.uid);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

/* ---------- LOGIN ---------- */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = { uid: cred.user.uid, email: cred.user.email };

      await pullAllCloudDataToLocal(user.uid);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

/* ---------- LOAD SESSION ---------- */
export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUser',
  async () => {
    const json = await AsyncStorage.getItem('user');
    return json ? JSON.parse(json) : null;
  }
);

/* ---------- LOGOUT ---------- */
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
  await AsyncStorage.removeItem('user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // LOGIN
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // LOAD
      .addCase(loadUserFromStorage.fulfilled, (s, a) => { s.user = a.payload; })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; });
  },
});

export default authSlice.reducer;

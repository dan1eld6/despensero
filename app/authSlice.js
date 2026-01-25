import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Registrar usuario
export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Iniciar sesión
export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Cerrar sesión
export const logOutUser = createAsyncThunk('auth/logOutUser', async () => {
  await signOut(auth);
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signUpUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(signUpUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signInUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signInUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(signInUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logOutUser.fulfilled, (state) => { state.user = null; });
  },
});

export default authSlice.reducer;

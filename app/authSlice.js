// app/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Registrar usuario
export const register = createAsyncThunk(
    'auth/register',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
            };
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Login usuario
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
            };
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Recuperar usuario de AsyncStorage al iniciar la app
export const loadUserFromStorage = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const json = await AsyncStorage.getItem('user');
            if (json) return JSON.parse(json);
            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.error = null;
            AsyncStorage.removeItem('user');
        },
    },
    extraReducers: (builder) => {
        builder
            // REGISTER
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // LOGIN
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // LOAD USER
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(loadUserFromStorage.rejected, (state) => {
                state.user = null;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

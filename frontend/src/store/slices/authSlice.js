import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading true
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('auth', JSON.stringify({ user: action.payload, isAuthenticated: true }));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('auth');
    },
    initializeAuth: (state) => {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const { user, isAuthenticated } = JSON.parse(authData);
        state.user = user;
        state.isAuthenticated = isAuthenticated;
      }
      state.loading = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/auth";

export const loginUser = createAsyncThunk("auth/login", async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
});

export const signupUser = createAsyncThunk("auth/signup", async (data) => {
  const res = await axios.post(`${API}/signup`, data);
  return res.data;
});

export const fetchUserInfo = createAsyncThunk("auth/fetchUserInfo", async (_, { getState }) => {
  const { token } = getState().auth;
  const res = await axios.get(`${API}/user-info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.user;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { 
    user: JSON.parse(localStorage.getItem("user")) || null, 
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

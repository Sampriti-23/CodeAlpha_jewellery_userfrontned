import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../store/Api";

/* ================= REGISTER ================= */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response?.data?.status_code === 201) {
        return response.data;
      }
    } catch (error) {
  console.log("REGISTER ERROR:", error.response?.data);  // 🔥 ADD THIS
  return rejectWithValue(error.response?.data || "Registration failed");
}
  }
);

/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", userData);

      if (response?.data?.status_code === 200) {
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

/* ================= SLICE ================= */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    regData:"",
    user:"",
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== REGISTER ===== */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.regData = payload;
     //   localStorage.setItem("user", JSON.stringify(payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== LOGIN ===== */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
 //     .addCase(loginUser.fulfilled, (state, action) => {
   //     state.loading = false;
     //   state.user = action.payload;
       // localStorage.setItem("user", JSON.stringify(action.payload));
      //})
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, {payload}) => {
        state.loading = false;
        state.user =payload;
        console.log("Login Payload:", payload);
       // sessionStorage.setItem("user", JSON.stringify(action.payload));
       sessionStorage.setItem("token", payload.token);

      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

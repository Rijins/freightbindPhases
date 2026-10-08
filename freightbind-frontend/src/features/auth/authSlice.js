import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import { parseApiError } from "../../utils/helpers";
import { saveToken, saveUser, getToken, getUser, clearAuthStorage } from "../../utils/storage";

const initialState = {
  user: getUser(),
  token: getToken(),
  isAuthenticated: Boolean(getToken()),
  loading: false,
  error: null,
  // Change-password lifecycle. Passwords themselves never live in Redux —
  // only the request status and a server error message.
  passwordLoading: false,
  passwordError: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await authService.login({ email, password });
      return result;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ fullName, email, password, phone }, { rejectWithValue }) => {
    try {
      const result = await authService.register({ fullName, email, password, phone });
      return result;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch {
    // Even if the backend call fails, clear local session so the user is
    // never stuck logged in on the client.
  }
  return true;
});

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const user = await authService.updateProfile(payload);
      return user;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await authService.changePassword({ currentPassword, newPassword });
      return true;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearPasswordError: (state) => {
      state.passwordError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        saveToken(action.payload.token);
        saveUser(action.payload.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        saveToken(action.payload.token);
        saveUser(action.payload.user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        saveUser(action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        clearAuthStorage();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        clearAuthStorage();
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        saveUser(action.payload);
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError =
          action.payload || { message: "Something went wrong while changing your password." };
      });
  },
});

export const { clearAuthError, clearPasswordError } = authSlice.actions;
export default authSlice.reducer;

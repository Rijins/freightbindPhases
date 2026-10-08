import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../services/userService";
import { parseApiError } from "../../utils/helpers";
import { DEFAULT_PAGE_SIZE } from "../../utils/constants";

// Admin user management state. Passwords never enter Redux — the slice only
// ever holds the safe user records returned by the backend.

const initialState = {
  items: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  query: {
    search: "",
    role: "",
    status: "",
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt",
    order: "desc",
  },
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
  actionSuccess: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await userService.listUsers(params);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await userService.createUser(payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await userService.setUserStatus(id, status);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = { ...state.query, ...action.payload };
    },
    resetQuery: (state) => {
      state.query = initialState.query;
    },
    clearActionStatus: (state) => {
      state.actionError = null;
      state.actionSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load users";
      })
      // Create
      .addCase(createUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = {
          message: "User created successfully",
          detail: `${action.payload.fullName} has been added as ${action.payload.role}.`,
        };
      })
      .addCase(createUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to create user", errors: [] };
      })
      // Update
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = {
          message: "User updated successfully",
          detail: `${action.payload.fullName}'s account has been updated.`,
        };
        const index = state.items.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update user", errors: [] };
      })
      // Status toggle
      .addCase(updateUserStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const user = action.payload;
        const isActive = user.status === "active";
        state.actionSuccess = {
          message: isActive ? "User activated" : "User deactivated",
          detail: `${user.fullName} is now ${isActive ? "active" : "inactive"}.`,
        };
        const index = state.items.findIndex((u) => u._id === user._id);
        if (index !== -1) state.items[index] = user;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update user status", errors: [] };
      });
  },
});

export const { setQuery, resetQuery, clearActionStatus } = usersSlice.actions;
export default usersSlice.reducer;

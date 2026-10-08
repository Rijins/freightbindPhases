import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import hubService from "../../services/hubService";
import userService from "../../services/userService";
import { parseApiError } from "../../utils/helpers";
import { DEFAULT_PAGE_SIZE } from "../../utils/constants";

// Admin hub management state. Also carries the current user's own hub
// (Hub Operations workspace) and the hub-operator candidate lists used by
// assignment selectors.

const initialState = {
  items: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  query: {
    search: "",
    type: "",
    status: "",
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt",
    order: "desc",
  },
  selectedHub: null,
  selectedHubOperators: [],
  operatorsLoading: false,
  myHub: null,
  myHubLoading: false,
  myHubError: null,
  candidates: [],
  candidatesLoading: false,
  loading: false,
  actionLoading: false,
  error: null,
  actionError: null,
  actionSuccess: null,
};

export const fetchHubs = createAsyncThunk(
  "hubs/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await hubService.listHubs(params);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createHub = createAsyncThunk(
  "hubs/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await hubService.createHub(payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateHub = createAsyncThunk(
  "hubs/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await hubService.updateHub(id, payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateHubStatus = createAsyncThunk(
  "hubs/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await hubService.setHubStatus(id, status);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchHubOperators = createAsyncThunk(
  "hubs/fetchOperators",
  async (hubId, { rejectWithValue }) => {
    try {
      return await hubService.listHubOperators(hubId);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchMyHub = createAsyncThunk(
  "hubs/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      return await hubService.getMyHub();
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchHubOperatorCandidates = createAsyncThunk(
  "hubs/fetchCandidates",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await userService.listHubOperatorCandidates(params);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

const hubsSlice = createSlice({
  name: "hubs",
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
    clearMyHubError: (state) => {
      state.myHubError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchHubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHubs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.hubs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchHubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load hubs";
      })
      // Create
      .addCase(createHub.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createHub.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = {
          message: "Hub created successfully",
          detail: `${action.payload.name} is now available for assignment.`,
        };
      })
      .addCase(createHub.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to create hub", errors: [] };
      })
      // Update
      .addCase(updateHub.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateHub.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = {
          message: "Hub updated successfully",
          detail: `${action.payload.name} has been updated.`,
        };
        const index = state.items.findIndex((h) => h._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedHub && state.selectedHub._id === action.payload._id) {
          state.selectedHub = action.payload;
        }
      })
      .addCase(updateHub.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update hub", errors: [] };
      })
      // Status toggle
      .addCase(updateHubStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateHubStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const hub = action.payload;
        const isActive = hub.status === "active";
        state.actionSuccess = {
          message: isActive ? "Hub activated" : "Hub deactivated",
          detail: `${hub.name} is now ${isActive ? "active" : "inactive"}.`,
        };
        const index = state.items.findIndex((h) => h._id === hub._id);
        if (index !== -1) state.items[index] = hub;
        if (state.selectedHub && state.selectedHub._id === hub._id) {
          state.selectedHub = hub;
        }
      })
      .addCase(updateHubStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update hub status", errors: [] };
      })
      // Operators of a hub
      .addCase(fetchHubOperators.pending, (state) => {
        state.operatorsLoading = true;
      })
      .addCase(fetchHubOperators.fulfilled, (state, action) => {
        state.operatorsLoading = false;
        state.selectedHub = action.payload.hub;
        state.selectedHubOperators = action.payload.operators;
      })
      .addCase(fetchHubOperators.rejected, (state, action) => {
        state.operatorsLoading = false;
        state.actionError = action.payload || { message: "Failed to load hub operators", errors: [] };
      })
      // My hub (Hub Operator workspace)
      .addCase(fetchMyHub.pending, (state) => {
        state.myHubLoading = true;
        state.myHubError = null;
      })
      .addCase(fetchMyHub.fulfilled, (state, action) => {
        state.myHubLoading = false;
        state.myHub = action.payload;
      })
      .addCase(fetchMyHub.rejected, (state, action) => {
        state.myHubLoading = false;
        state.myHubError = action.payload || { message: "No hub assigned" };
      })
      // Candidate selectors
      .addCase(fetchHubOperatorCandidates.pending, (state) => {
        state.candidatesLoading = true;
      })
      .addCase(fetchHubOperatorCandidates.fulfilled, (state, action) => {
        state.candidatesLoading = false;
        state.candidates = action.payload.users;
      })
      .addCase(fetchHubOperatorCandidates.rejected, (state) => {
        state.candidatesLoading = false;
      });
  },
});

export const { setQuery, resetQuery, clearActionStatus, clearMyHubError } = hubsSlice.actions;
export default hubsSlice.reducer;

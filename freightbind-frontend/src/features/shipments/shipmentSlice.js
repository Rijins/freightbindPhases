import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import shipmentService from "../../services/shipmentService";
import { parseApiError } from "../../utils/helpers";
import { DEFAULT_PAGE_SIZE } from "../../utils/constants";

const initialState = {
  items: [],
  selected: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  query: {
    search: "",
    status: "",
    priority: "",
    cargoType: "",
    shipmentType: "",
    origin: "",
    destination: "",
    assignedDispatcher: "",
    createdBy: "",
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    sortBy: "createdAt",
    order: "desc",
  },
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  detailError: null,
  actionError: null,
  actionSuccess: null,
};

export const fetchShipments = createAsyncThunk(
  "shipments/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await shipmentService.getShipments(params);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchShipmentById = createAsyncThunk(
  "shipments/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await shipmentService.getShipment(id);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createShipment = createAsyncThunk(
  "shipments/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await shipmentService.createShipment(payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateShipment = createAsyncThunk(
  "shipments/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await shipmentService.updateShipment(id, payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const deleteShipment = createAsyncThunk(
  "shipments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await shipmentService.deleteShipment(id);
      return id;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

const shipmentSlice = createSlice({
  name: "shipments",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = { ...state.query, ...action.payload };
    },
    resetQuery: (state) => {
      state.query = initialState.query;
    },
    clearSelectedShipment: (state) => {
      state.selected = null;
      state.detailError = null;
    },
    clearActionStatus: (state) => {
      state.actionError = null;
      state.actionSuccess = null;
    },
    // Realtime reducers (driven by the socket listener — see
    // hooks/useRealtimeShipments.js). Both are idempotent: they replace
    // records by _id, so a user who is in both their role room and the
    // shipment room never sees duplicated state.
    realtimeShipmentUpdated: (state, action) => {
      const shipment = action.payload?.shipment || action.payload;
      if (!shipment?._id) return;
      const index = state.items.findIndex((s) => s?._id === shipment._id);
      if (index !== -1) state.items[index] = shipment;
      if (state.selected?._id === shipment._id) state.selected = shipment;
    },
    realtimeShipmentDetail: (state, action) => {
      const shipment = action.payload?.shipment || action.payload;
      if (!shipment?._id) return;
      const index = state.items.findIndex((s) => s?._id === shipment._id);
      if (index !== -1) state.items[index] = shipment;
      if (state.selected?._id === shipment._id) state.selected = shipment;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.shipments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load shipments";
      })
      // Detail
      .addCase(fetchShipmentById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload?.message || "Failed to load shipment";
      })
      // Create
      .addCase(createShipment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Shipment created successfully";
        state.selected = action.payload;
      })
      .addCase(createShipment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to create shipment", errors: [] };
      })
      // Update
      .addCase(updateShipment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateShipment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Shipment updated successfully";
        state.selected = action.payload;
        const index = state.items.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateShipment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update shipment", errors: [] };
      })
      // Delete
      .addCase(deleteShipment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteShipment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = "Shipment deleted successfully";
        state.items = state.items.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteShipment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to delete shipment", errors: [] };
      });
  },
});

export const { setQuery, resetQuery, clearSelectedShipment, clearActionStatus, realtimeShipmentUpdated, realtimeShipmentDetail } =
  shipmentSlice.actions;
export default shipmentSlice.reducer;

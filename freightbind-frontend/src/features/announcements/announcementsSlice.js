import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import announcementService from "../../services/announcementService";
import { parseApiError } from "../../utils/helpers";
import { DEFAULT_PAGE_SIZE } from "../../utils/constants";

// System announcement state. Non-admin users only ever receive active,
// in-window announcements (the backend enforces it); admins see everything
// and drive the management actions through this slice.

const initialState = {
  items: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  query: {
    search: "",
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

export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await announcementService.listAnnouncements(params);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcements/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await announcementService.createAnnouncement(payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  "announcements/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await announcementService.updateAnnouncement(id, payload);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const setAnnouncementStatus = createAsyncThunk(
  "announcements/setStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await announcementService.setAnnouncementStatus(id, status);
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/delete",
  async (id, { rejectWithValue }) => {
    try {
      await announcementService.deleteAnnouncement(id);
      return id;
    } catch (error) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

const applyItemUpdate = (state, updated) => {
  const index = state.items.findIndex((item) => item._id === updated._id);
  if (index !== -1) state.items[index] = updated;
};

const announcementsSlice = createSlice({
  name: "announcements",
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
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.announcements;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load announcements";
      })
      // Create
      .addCase(createAnnouncement.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = {
          message: "Announcement created",
          detail:
            action.payload.status === "active"
              ? `"${action.payload.title}" is live and has been sent to all users.`
              : `"${action.payload.title}" saved as inactive. Activate it to publish.`,
        };
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to create announcement", errors: [] };
      })
      // Update
      .addCase(updateAnnouncement.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = {
          message: "Announcement updated",
          detail: `"${action.payload.title}" has been saved.`,
        };
        applyItemUpdate(state, action.payload);
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update announcement", errors: [] };
      })
      // Status toggle
      .addCase(setAnnouncementStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(setAnnouncementStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const announcement = action.payload;
        const isActive = announcement.status === "active";
        state.actionSuccess = {
          message: isActive ? "Announcement activated" : "Announcement deactivated",
          detail: isActive
            ? `"${announcement.title}" is now live and was sent to all users.`
            : `"${announcement.title}" is no longer visible to users.`,
        };
        applyItemUpdate(state, announcement);
      })
      .addCase(setAnnouncementStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to update announcement status", errors: [] };
      })
      // Delete
      .addCase(deleteAnnouncement.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.actionSuccess = {
          message: "Announcement deleted",
          detail: "The announcement was removed. Already-delivered notifications remain in users' inboxes.",
        };
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || { message: "Failed to delete announcement", errors: [] };
      });
  },
});

export const { setQuery, resetQuery, clearActionStatus } = announcementsSlice.actions;
export default announcementsSlice.reducer;

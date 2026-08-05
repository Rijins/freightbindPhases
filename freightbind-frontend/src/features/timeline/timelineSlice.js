import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import timelineService from "../../services/timeLineService";
import { parseApiError } from "../../utils/helpers";

const initialState = {
    timeline: [],
    latestEvent: null,
    selectedShipment: null,
    loading: false,
    refreshing: false,
    error: null,
    latestLoading: false,
    latestError: null,
    actionLoading: false,
    actionError: null,
    actionSuccess: null,
    lastUpdated: null,
};

export const fetchTimeline = createAsyncThunk(
    "timeline/fetchTimeline",
    async (shipmentId, { rejectWithValue }) => {
        try {
            const timeline = await timelineService.getTimeline(shipmentId);
            return { shipmentId, timeline };
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

export const refreshTimeline = createAsyncThunk(
    "timeline/refreshTimeline",
    async (shipmentId, { rejectWithValue }) => {
        try {
            const timeline = await timelineService.getTimeline(shipmentId);
            return { shipmentId, timeline };
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

export const fetchLatestEvent = createAsyncThunk(
    "timeline/fetchLatestEvent",
    async (shipmentId, { rejectWithValue }) => {
        try {
            const event = await timelineService.getLatestEvent(shipmentId);
            return event;
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

export const updateShipmentStatus = createAsyncThunk(
    "timeline/updateShipmentStatus",
    async ({ shipmentId, status, note }, { rejectWithValue }) => {
        try {
            return await timelineService.updateStatus({ shipmentId, status, note });
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

export const updateShipmentLocation = createAsyncThunk(
    "timeline/updateShipmentLocation",
    async ({ shipmentId, location }, { rejectWithValue }) => {
        try {
            return await timelineService.updateLocation({ shipmentId, location });
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

export const assignShipmentDispatcher = createAsyncThunk(
    "timeline/assignShipmentDispatcher",
    async ({ shipmentId, dispatcherId }, { rejectWithValue }) => {
        try {
            return await timelineService.assignDispatcher({ shipmentId, dispatcherId });
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

export const addTimelineNote = createAsyncThunk(
    "timeline/addTimelineNote",
    async ({ shipmentId, note }, { rejectWithValue }) => {
        try {
            return await timelineService.addNote({ shipmentId, note });
        } catch (error) {
            return rejectWithValue(parseApiError(error));
        }
    }
);

// Appends a timeline event returned by a mutation response without ever
// duplicating a row. The backend emits `timeline:updated` over the socket
// BEFORE the mutation response resolves, so realtimeTimelineAppended usually
// lands first — the fulfilled handler must not push a second copy of the
// same _id. Entries stay in chronological order after every append.
const upsertAppendedEvent = (state, event) => {
    if (!event?._id) return;
    if (!state.timeline.some((entry) => entry?._id === event._id)) {
        state.timeline.push(event);
        state.timeline.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }
};

const timelineSlice = createSlice({
    name: "timeline",
    initialState,
    reducers: {
        clearTimeline: (state) => {
            state.timeline = [];
            state.latestEvent = null;
            state.selectedShipment = null;
            state.error = null;
            state.latestError = null;
            state.lastUpdated = null;
        },
        resetTimelineErrors: (state) => {
            state.error = null;
            state.latestError = null;
            state.actionError = null;
        },
        clearActionStatus: (state) => {
            state.actionError = null;
            state.actionSuccess = null;
        },
        // Realtime reducer (driven by hooks/useRealtimeShipments.js). Appends
        // a freshly emitted timeline entry to the currently open timeline.
        // - Ignored unless it belongs to the timeline being viewed.
        // - Deduped by event _id: when the acting user's own optimistic push
        //   already added the event, the socket copy REPLACES it (it is the
        //   populated version from the server), so there is never a duplicate
        //   row and the fully populated record wins.
        // - Entries are kept in chronological (createdAt) order.
        realtimeTimelineAppended: (state, action) => {
            const { shipmentId, event } = action.payload || {};
            if (!event?._id) return;
            if (state.selectedShipment !== shipmentId) return;

            const existingIndex = state.timeline.findIndex((e) => e?._id === event._id);
            if (existingIndex !== -1) {
                state.timeline[existingIndex] = event;
            } else {
                state.timeline.push(event);
                state.timeline.sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
            }

            if (!state.latestEvent || new Date(event.createdAt) >= new Date(state.latestEvent.createdAt)) {
                state.latestEvent = event;
            }
            state.lastUpdated = new Date().toISOString();
        },
    },
    extraReducers: (builder) => {
        builder
            // Initial load
            .addCase(fetchTimeline.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTimeline.fulfilled, (state, action) => {
                state.loading = false;
                state.timeline = action.payload.timeline;
                state.selectedShipment = action.payload.shipmentId;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchTimeline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to load timeline";
            })
            // Refresh (same data, separate loading flag so the page can show a
            // small refresh indicator instead of the full skeleton)
            .addCase(refreshTimeline.pending, (state) => {
                state.refreshing = true;
                state.error = null;
            })
            .addCase(refreshTimeline.fulfilled, (state, action) => {
                state.refreshing = false;
                state.timeline = action.payload.timeline;
                state.selectedShipment = action.payload.shipmentId;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(refreshTimeline.rejected, (state, action) => {
                state.refreshing = false;
                state.error = action.payload?.message || "Failed to refresh timeline";
            })
            // Latest event
            .addCase(fetchLatestEvent.pending, (state) => {
                state.latestLoading = true;
                state.latestError = null;
            })
            .addCase(fetchLatestEvent.fulfilled, (state, action) => {
                state.latestLoading = false;
                state.latestEvent = action.payload;
            })
            .addCase(fetchLatestEvent.rejected, (state, action) => {
                state.latestLoading = false;
                state.latestError = action.payload?.message || "Failed to load latest event";
            });

        // Mutations: status / location / dispatcher / note all share the same
        // pending/rejected shape, and each appends its returned event onto the
        // timeline immediately so the UI reflects the change without waiting
        // for a full refetch.
        const mutationCases = [updateShipmentStatus, updateShipmentLocation, assignShipmentDispatcher];
        mutationCases.forEach((thunk) => {
            builder
                .addCase(thunk.pending, (state) => {
                    state.actionLoading = true;
                    state.actionError = null;
                    state.actionSuccess = null;
                })
                .addCase(thunk.fulfilled, (state, action) => {
                    state.actionLoading = false;
                    state.actionSuccess = "Timeline updated successfully";
                    if (action.payload?.event) {
                        upsertAppendedEvent(state, action.payload.event);
                        state.latestEvent = action.payload.event;
                        state.lastUpdated = new Date().toISOString();
                    }
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.actionLoading = false;
                    state.actionError = action.payload || { message: "Failed to update shipment", errors: [] };
                });
        });

        builder
            .addCase(addTimelineNote.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
                state.actionSuccess = null;
            })
            .addCase(addTimelineNote.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.actionSuccess = "Note added successfully";
                if (action.payload?.event) {
                    upsertAppendedEvent(state, action.payload.event);
                    state.latestEvent = action.payload.event;
                    state.lastUpdated = new Date().toISOString();
                }
            })
            .addCase(addTimelineNote.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload || { message: "Failed to add note", errors: [] };
            });
    },
});

export const { clearTimeline, resetTimelineErrors, clearActionStatus, realtimeTimelineAppended } = timelineSlice.actions;
export default timelineSlice.reducer;
import axiosInstance from "../api/axiosInstance";

// Reusable functions wrapping the existing backend timeline endpoints
// (Phase 04 Part 01 — routes/timelineRoutes.js, mounted at /api/timeline).
// Never call axios directly from components — go through this service.

const getTimeline = async (shipmentId) => {
    const { data } = await axiosInstance.get(`/timeline/${shipmentId}`);
    // Safely extract timeline array from potential API wrapper
    return data?.data?.timeline ?? data?.timeline ?? [];
};

// FIX: Removed /latest suffix which causes 404
// Backend returns full timeline; we take the last event client-side
const getLatestEvent = async (shipmentId) => {
    try {
        const { data } = await axiosInstance.get(`/timeline/${shipmentId}`);
        const timeline = data?.data?.timeline ?? data?.timeline ?? [];
        
        if (!Array.isArray(timeline) || timeline.length === 0) {
            return null;
        }
        
        // Return last event as "latest" since backend has no dedicated endpoint
        return timeline[timeline.length - 1];
    } catch (error) {
        console.warn('Failed to fetch latest timeline event:', error.message);
        return null;
    }
};

const updateStatus = async ({ shipmentId, status, note }) => {
    const { data } = await axiosInstance.post("/timeline/status", { shipmentId, status, note });
    return data?.data ?? data;
};

const updateLocation = async ({ shipmentId, location }) => {
    const { data } = await axiosInstance.post("/timeline/location", { shipmentId, location });
    return data?.data ?? data;
};

const assignDispatcher = async ({ shipmentId, dispatcherId }) => {
    const { data } = await axiosInstance.post("/timeline/dispatcher", { shipmentId, dispatcherId });
    return data?.data ?? data;
};

const addNote = async ({ shipmentId, note }) => {
    const { data } = await axiosInstance.post("/timeline/note", { shipmentId, note });
    return data?.data ?? data;
};

const timelineService = {
    getTimeline,
    getLatestEvent,
    updateStatus,
    updateLocation,
    assignDispatcher,
    addNote,
};

export default timelineService;
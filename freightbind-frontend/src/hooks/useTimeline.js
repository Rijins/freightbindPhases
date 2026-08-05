import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTimeline,
    refreshTimeline,
    fetchLatestEvent,
    updateShipmentStatus,
    updateShipmentLocation,
    assignShipmentDispatcher,
    addTimelineNote,
    clearTimeline,
    resetTimelineErrors,
    clearActionStatus,
} from "../features/timeline/timelineSlice";
import { fetchShipmentById } from "../features/shipments/shipmentSlice";

/**
 * Reusable Timeline logic for any component. Wraps the timeline slice so
 * components never dispatch thunks or read `state.timeline` directly.
 */
const useTimeline = (shipmentId) => {
    const dispatch = useDispatch();
    const {
        timeline,
        latestEvent,
        selectedShipment,
        loading,
        refreshing,
        error,
        latestLoading,
        latestError,
        actionLoading,
        actionError,
        actionSuccess,
        lastUpdated,
    } = useSelector((state) => state.timeline);

    const load = useCallback(() => {
        if (shipmentId) dispatch(fetchTimeline(shipmentId));
    }, [dispatch, shipmentId]);

    const refresh = useCallback(() => {
        if (shipmentId) dispatch(refreshTimeline(shipmentId));
    }, [dispatch, shipmentId]);

    const loadLatest = useCallback(() => {
        if (shipmentId) dispatch(fetchLatestEvent(shipmentId));
    }, [dispatch, shipmentId]);

    // Auto-load on mount / when the shipment changes; clear on unmount so a
    // previously viewed shipment's timeline never flashes for the next one.
    useEffect(() => {
        load();
        return () => {
            dispatch(clearTimeline());
        };
    }, [load, dispatch]);

    const syncShipment = useCallback(() => {
        if (shipmentId) dispatch(fetchShipmentById(shipmentId));
    }, [dispatch, shipmentId]);

    const updateStatus = useCallback(
        async (status, note) => {
            const result = await dispatch(updateShipmentStatus({ shipmentId, status, note }));
            if (updateShipmentStatus.fulfilled.match(result)) syncShipment();
            return result;
        },
        [dispatch, shipmentId, syncShipment]
    );

    const updateLocation = useCallback(
        async (location) => {
            const result = await dispatch(updateShipmentLocation({ shipmentId, location }));
            if (updateShipmentLocation.fulfilled.match(result)) syncShipment();
            return result;
        },
        [dispatch, shipmentId, syncShipment]
    );

    const assignDispatcher = useCallback(
        async (dispatcherId) => {
            const result = await dispatch(assignShipmentDispatcher({ shipmentId, dispatcherId }));
            if (assignShipmentDispatcher.fulfilled.match(result)) syncShipment();
            return result;
        },
        [dispatch, shipmentId, syncShipment]
    );

    const addNote = useCallback(
        async (note) => {
            return dispatch(addTimelineNote({ shipmentId, note }));
        },
        [dispatch, shipmentId]
    );

    const clearErrors = useCallback(() => dispatch(resetTimelineErrors()), [dispatch]);
    const clearActions = useCallback(() => dispatch(clearActionStatus()), [dispatch]);

    return {
        timeline,
        latestEvent,
        selectedShipment,
        loading,
        refreshing,
        error,
        latestLoading,
        latestError,
        actionLoading,
        actionError,
        actionSuccess,
        lastUpdated,
        load,
        refresh,
        loadLatest,
        updateStatus,
        updateLocation,
        assignDispatcher,
        addNote,
        clearErrors,
        clearActions,
    };
};

export default useTimeline;
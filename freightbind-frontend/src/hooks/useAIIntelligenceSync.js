import { useEffect, useRef } from "react";
import useSocket from "./useSocket";
import { SOCKET_EVENTS } from "../utils/constants";

/**
 * useAIIntelligenceSync — realtime targeting for the AI Command Center
 * (Phase 8 Part 4). Reuses the EXISTING socket infrastructure: one listener
 * set registered through the shared eventManager (per-(event, handler)
 * dedupe + registeredRef guard, exactly like useDashboardSync), so duplicate
 * listeners are impossible.
 *
 * Listens to the shipment events the backend already emits and reports the
 * AFFECTED shipment only (never a full dashboard refresh):
 *   - shipment:updated / shipment:status-changed / shipment:assigned carry
 *     the full populated shipment document.
 *   - timeline:updated carries the shipmentId (shipment-room only; when the
 *     dashboard user is also in that room — e.g. after visiting Shipment
 *     Details — note-only changes are covered too).
 *   - ai:alert (Phase 9 Part 4) carries the shipmentId of a shipment whose
 *     AI analysis just flagged High risk — the affected shipment's analysis
 *     is refreshed so the panel reflects the alert immediately.
 *
 * Role scoping mirrors useDashboardSync: Carrier Dispatchers only see their
 * assigned shipments, so role dashboards only ever refresh authorized rows.
 *
 * The hook does NOT call the AI client itself; the caller's onShipmentAffected
 * decides whether to evict cache / re-run analysis.
 */
const useAIIntelligenceSync = ({ onShipmentAffected, scope } = {}) => {
  const { socket, eventManager } = useSocket();

  const onAffectedRef = useRef(onShipmentAffected);
  onAffectedRef.current = onShipmentAffected;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!eventManager) return undefined;

    if (!registeredRef.current) {
      registeredRef.current = true;

      const handleShipmentEvent = (payload) => {
        const shipment = payload?.shipment || payload;
        if (!shipment?._id) return;

        // Role scope: Carrier Dispatchers only track their own shipments.
        const currentScope = scopeRef.current;
        if (currentScope?.assignedDispatcher) {
          const assigned = shipment.assignedDispatcher?._id ?? shipment.assignedDispatcher;
          if (
            assigned === undefined ||
            String(assigned) !== String(currentScope.assignedDispatcher)
          ) {
            return;
          }
        }

        onAffectedRef.current?.({ shipmentId: shipment._id, shipment });
      };

      const handleTimelineEvent = (payload) => {
        const shipmentId = payload?.shipmentId;
        if (!shipmentId) return;
        onAffectedRef.current?.({ shipmentId, shipment: null });
      };

      const handleAIAlert = (payload) => {
        const shipmentId = payload?.shipmentId;
        if (!shipmentId) return;
        onAffectedRef.current?.({ shipmentId, shipment: null });
      };

      eventManager
        .on(SOCKET_EVENTS.SHIPMENT_UPDATED, handleShipmentEvent)
        .on(SOCKET_EVENTS.SHIPMENT_STATUS_CHANGED, handleShipmentEvent)
        .on(SOCKET_EVENTS.SHIPMENT_ASSIGNED, handleShipmentEvent)
        .on(SOCKET_EVENTS.TIMELINE_UPDATED, handleTimelineEvent)
        .on(SOCKET_EVENTS.AI_ALERT, handleAIAlert);
    }

    // If a socket already exists (e.g. provider effect ran before this hook
    // mounted), wire the newly registered handlers. The manager's per-socket
    // idempotency guard makes this a no-op when already attached.
    if (socket) {
      eventManager.attach(socket);
    }

    return undefined;
  }, [socket, eventManager]);

  return null;
};

export default useAIIntelligenceSync;

// Unit tests for services/shipmentService.js authorizeUpdate() — the role
// matrix for editing shipments, especially the Hub Operator location-only +
// hub-scoped rule added to close the Phase 04 privilege-escalation gap.

const { authorizeUpdate } = require("../services/shipmentService");

const HUB_A = "hub-a";
const HUB_B = "hub-b";

// Simulates mongoose's ObjectId shape with the .equals() method the service
// relies on for dispatcher identity checks.
const makeId = (value) => ({
    toString: () => value,
    equals: (other) => String(other._id || other) === value,
});

const makeShipment = ({ hub = HUB_A, assignedDispatcher = null, status = "In Transit" } = {}) => ({
    _id: "ship1",
    hub,
    assignedDispatcher: assignedDispatcher ? makeId(assignedDispatcher) : null,
    status,
});

const admin = { role: "Admin", _id: makeId("u-admin") };
const director = { role: "Logistics Director", _id: makeId("u-director") };
const dispatcherA = { role: "Carrier Dispatcher", _id: "u-d1" };
const dispatcherB = { role: "Carrier Dispatcher", _id: "u-d2" };
const hubOperatorAtA = { role: "Hub Operator", hub: HUB_A };
const hubOperatorAtB = { role: "Hub Operator", hub: HUB_B };
const hubOperatorNoHub = { role: "Hub Operator", hub: null };

describe("authorizeUpdate", () => {
    test("admin and logistics director may update any fields", () => {
        expect(() =>
            authorizeUpdate(makeShipment(), { title: "new", status: "Delayed" }, admin)
        ).not.toThrow();
        expect(() =>
            authorizeUpdate(makeShipment(), { title: "new" }, director)
        ).not.toThrow();
    });

    test("hub operator may only ever update currentLocation", () => {
        expect(() =>
            authorizeUpdate(makeShipment(), { currentLocation: "Warehouse 9" }, hubOperatorAtA)
        ).not.toThrow();
        expect(() =>
            authorizeUpdate(makeShipment(), { title: "hack" }, hubOperatorAtA)
        ).toThrowError(/location only/i);
        expect(() =>
            authorizeUpdate(makeShipment(), { currentLocation: "X", status: "Delayed" }, hubOperatorAtA)
        ).toThrowError(/location only/i);
    });

    test("hub operator cannot update shipments belonging to another hub", () => {
        expect(() =>
            authorizeUpdate(makeShipment({ hub: HUB_B }), { currentLocation: "X" }, hubOperatorAtA)
        ).toThrowError(/hub/i);
    });

    test("hub operator without a hub cannot update any shipment", () => {
        expect(() =>
            authorizeUpdate(makeShipment(), { currentLocation: "X" }, hubOperatorNoHub)
        ).toThrowError(/hub/i);
    });

    test("dispatcher may update only shipments assigned to them", () => {
        const mine = makeShipment({ assignedDispatcher: dispatcherA._id });
        expect(() =>
            authorizeUpdate(mine, { currentLocation: "X" }, dispatcherA)
        ).not.toThrow();
        expect(() =>
            authorizeUpdate(mine, { currentLocation: "X" }, dispatcherB)
        ).toThrowError(/assigned/i);
    });

    test("dispatcher cannot reassign or re-hub a shipment", () => {
        const mine = makeShipment({ assignedDispatcher: dispatcherA._id });
        expect(() =>
            authorizeUpdate(mine, { assignedDispatcher: dispatcherB._id }, dispatcherA)
        ).toThrowError(/reassign/i);
        expect(() =>
            authorizeUpdate(mine, { hub: HUB_B }, dispatcherA)
        ).toThrowError(/hub/i);
    });
});
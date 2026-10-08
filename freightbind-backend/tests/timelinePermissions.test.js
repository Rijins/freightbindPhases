// Unit tests for services/timelineService.js permission assertions.
//
// These are PURE permission checks — they take (shipment, user) plain objects
// and never touch the database. Exporting the asserts keeps business rules
// testable without a live MongoDB or .env.
//
// `equals` is a stand-in for mongoose's ObjectId.equals used by the service;
// the tests simulate ObjectId references with plain objects that implement it.

const {
    assertCanUpdateStatus,
    assertCanUpdateLocation,
    assertCanAddNote,
    assertCanViewTimeline,
} = require("../services/timelineService");

const makeId = (value) => ({
    toString: () => value,
    equals: (other) => String(other._id || other) === value,
});

const SAME_HUB = makeId("h1");
const OTHER_HUB = makeId("h2");
const DISPATCHER_ID = "d1";
const OTHER_DISPATCHER_ID = "d2";

const makeShipment = ({ hub = SAME_HUB, assignedDispatcher = null } = {}) => ({
    hub,
    assignedDispatcher: assignedDispatcher ? makeId(assignedDispatcher) : null,
});

const makeUser = ({ role, hub = null, _id = null }) => ({ role, hub, _id });

const admin = makeUser({ role: "Admin" });
const director = makeUser({ role: "Logistics Director" });
const dispatcher = makeUser({ role: "Carrier Dispatcher", _id: DISPATCHER_ID });
const otherDispatcher = makeUser({ role: "Carrier Dispatcher", _id: OTHER_DISPATCHER_ID });
const hubOperatorAtHub = makeUser({ role: "Hub Operator", hub: SAME_HUB });
const hubOperatorElsewhere = makeUser({ role: "Hub Operator", hub: OTHER_HUB });
const hubOperatorNoHub = makeUser({ role: "Hub Operator", hub: null });

describe("assertCanUpdateStatus", () => {
    test("admin and logistics director may always update status", () => {
        expect(() => assertCanUpdateStatus(makeShipment(), admin)).not.toThrow();
        expect(() => assertCanUpdateStatus(makeShipment(), director)).not.toThrow();
    });

    test("assigned dispatcher may update status", () => {
        expect(() =>
            assertCanUpdateStatus(makeShipment({ assignedDispatcher: DISPATCHER_ID }), dispatcher)
        ).not.toThrow();
    });

    test("unassigned dispatcher is forbidden", () => {
        expect(() =>
            assertCanUpdateStatus(makeShipment({ assignedDispatcher: DISPATCHER_ID }), otherDispatcher)
        ).toThrowError(/assigned/i);
    });

    test("hub operators can never update status", () => {
        expect(() => assertCanUpdateStatus(makeShipment(), hubOperatorAtHub)).toThrowError(/Forbidden/i);
    });
});

describe("assertCanUpdateLocation", () => {
    test("admin and director may always update location", () => {
        expect(() => assertCanUpdateLocation(makeShipment(), admin)).not.toThrow();
        expect(() => assertCanUpdateLocation(makeShipment(), director)).not.toThrow();
    });

    test("assigned dispatcher may update location", () => {
        expect(() =>
            assertCanUpdateLocation(makeShipment({ assignedDispatcher: DISPATCHER_ID }), dispatcher)
        ).not.toThrow();
    });

    test("hub operator may update location only on their own hub's shipment", () => {
        expect(() => assertCanUpdateLocation(makeShipment(), hubOperatorAtHub)).not.toThrow();
        expect(() => assertCanUpdateLocation(makeShipment(), hubOperatorElsewhere)).toThrowError(/hub/i);
        expect(() => assertCanUpdateLocation(makeShipment(), hubOperatorNoHub)).toThrowError(/hub/i);
    });
});

describe("assertCanAddNote", () => {
    test("admin and director may always add notes", () => {
        expect(() => assertCanAddNote(makeShipment(), admin)).not.toThrow();
        expect(() => assertCanAddNote(makeShipment(), director)).not.toThrow();
    });

    test("assigned dispatcher may add notes", () => {
        expect(() =>
            assertCanAddNote(makeShipment({ assignedDispatcher: DISPATCHER_ID }), dispatcher)
        ).not.toThrow();
    });

    test("hub operator may add notes only on their own hub's shipment", () => {
        expect(() => assertCanAddNote(makeShipment(), hubOperatorAtHub)).not.toThrow();
        expect(() => assertCanAddNote(makeShipment(), hubOperatorElsewhere)).toThrowError(/hub/i);
        expect(() => assertCanAddNote(makeShipment(), hubOperatorNoHub)).toThrowError(/hub/i);
    });
});

describe("assertCanViewTimeline", () => {
    test("admin, director and dispatchers may view any timeline", () => {
        expect(() => assertCanViewTimeline(makeShipment(), admin)).not.toThrow();
        expect(() => assertCanViewTimeline(makeShipment(), director)).not.toThrow();
        expect(() => assertCanViewTimeline(makeShipment(), dispatcher)).not.toThrow();
    });

    test("hub operator may view only their own hub's timeline", () => {
        expect(() => assertCanViewTimeline(makeShipment(), hubOperatorAtHub)).not.toThrow();
        expect(() => assertCanViewTimeline(makeShipment(), hubOperatorElsewhere)).toThrowError(/hub/i);
        expect(() => assertCanViewTimeline(makeShipment(), hubOperatorNoHub)).toThrowError(/hub/i);
    });
});
// Unit tests for sockets/connection.js room-join authorization.
//
// canJoinShipmentRoom(shipment, user) is the pure rule behind the async
// room-join handler — it must never grant broader access than the REST API
// (services/shipmentService.js getShipmentById()).

const { canJoinShipmentRoom } = require("../sockets/connection");

const HUB_A = "hub-a";
const HUB_B = "hub-b";

const makeShipment = (hub) => ({ _id: "ship1", hub });

const makeUser = (partial) => ({
    id: "u1",
    role: "",
    hub: null,
    ...partial,
});

describe("canJoinShipmentRoom", () => {
    test("admin and logistics director may join any shipment room", () => {
        expect(canJoinShipmentRoom(makeShipment(HUB_A), makeUser({ role: "Admin" }))).toBe(true);
        expect(canJoinShipmentRoom(makeShipment(HUB_B), makeUser({ role: "Logistics Director" }))).toBe(true);
    });

    test("carrier dispatcher may join any shipment room they can view", () => {
        expect(canJoinShipmentRoom(makeShipment(HUB_A), makeUser({ role: "Carrier Dispatcher" }))).toBe(true);
        expect(canJoinShipmentRoom(makeShipment(HUB_B), makeUser({ role: "Carrier Dispatcher" }))).toBe(true);
    });

    test("hub operator may join only their own hub's shipment room", () => {
        const operator = makeUser({ role: "Hub Operator", hub: HUB_A });
        expect(canJoinShipmentRoom(makeShipment(HUB_A), operator)).toBe(true);
        expect(canJoinShipmentRoom(makeShipment(HUB_B), operator)).toBe(false);
    });

    test("hub operator without a hub cannot join any shipment room", () => {
        const noHub = makeUser({ role: "Hub Operator", hub: null });
        expect(canJoinShipmentRoom(makeShipment(HUB_A), noHub)).toBe(false);
    });

    test("unknown shipment or missing user is always denied", () => {
        expect(canJoinShipmentRoom(null, makeUser({ role: "Admin" }))).toBe(false);
        expect(canJoinShipmentRoom(undefined, makeUser({ role: "Admin" }))).toBe(false);
        expect(canJoinShipmentRoom(makeShipment(HUB_A), null)).toBe(false);
        expect(canJoinShipmentRoom(makeShipment(HUB_A), undefined)).toBe(false);
    });

    test("unknown roles are denied", () => {
        expect(canJoinShipmentRoom(makeShipment(HUB_A), makeUser({ role: "Admin2" }))).toBe(false);
        expect(canJoinShipmentRoom(makeShipment(HUB_A), makeUser({ role: "" }))).toBe(false);
    });
});
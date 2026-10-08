// Unit tests for helpers/socketRooms.js — the room-name builders used by
// both the server (sockets/service layer) and mirrored on the frontend.
// Pure functions: no DB, no env, no network.

const {
    ROOM_PREFIXES,
    GLOBAL_ADMIN_ROOM,
    isValidMongoId,
    buildUserRoom,
    buildRoleRoom,
    buildShipmentRoom,
    isShipmentRoom,
} = require("../helpers/socketRooms");

const VALID_ID = "64b0f3a2c9e5d45a12345678";
const OTHER_VALID_ID = "64b0f3a2c9e5d45a87654321";

describe("isValidMongoId", () => {
    test("accepts a 24-char hex id", () => {
        expect(isValidMongoId(VALID_ID)).toBe(true);
    });

    test("rejects non-hex and wrong-length values", () => {
        expect(isValidMongoId("not-an-id")).toBe(false);
        expect(isValidMongoId("1234")).toBe(false);
        expect(isValidMongoId("")).toBe(false);
    });
});

describe("buildUserRoom", () => {
    test("returns user:<id> for a valid id", () => {
        expect(buildUserRoom(VALID_ID)).toBe(`user:${VALID_ID}`);
    });

    test("throws on an invalid id", () => {
        expect(() => buildUserRoom("bad")).toThrow("Invalid user id for socket room");
    });
});

describe("buildRoleRoom", () => {
    test("returns role:<role> for a known role", () => {
        expect(buildRoleRoom("Admin")).toBe("role:Admin");
    });

    test("throws on an unknown role", () => {
        expect(() => buildRoleRoom("Unknown Role")).toThrow("Unknown role for socket room");
    });
});

describe("buildShipmentRoom", () => {
    test("returns shipment:<id> for a valid id", () => {
        expect(buildShipmentRoom(VALID_ID)).toBe(`shipment:${VALID_ID}`);
    });

    test("throws on an invalid id", () => {
        expect(() => buildShipmentRoom("bad")).toThrow("Invalid shipment id for socket room");
    });
});

describe("isShipmentRoom", () => {
    test("accepts a well-formed shipment room", () => {
        expect(isShipmentRoom(`shipment:${VALID_ID}`)).toBe(true);
    });

    test("rejects user/role/admin rooms and malformed shipments", () => {
        expect(isShipmentRoom(`user:${VALID_ID}`)).toBe(false);
        expect(isShipmentRoom(`role:Admin`)).toBe(false);
        expect(isShipmentRoom(GLOBAL_ADMIN_ROOM)).toBe(false);
        expect(isShipmentRoom("shipment:invalid")).toBe(false);
        expect(isShipmentRoom("shipment:")).toBe(false);
        expect(isShipmentRoom(12345)).toBe(false);
    });
});

describe("constants", () => {
    test("exposes the expected room prefixes", () => {
        expect(ROOM_PREFIXES.USER).toBe("user");
        expect(ROOM_PREFIXES.ROLE).toBe("role");
        expect(ROOM_PREFIXES.SHIPMENT).toBe("shipment");
        expect(ROOM_PREFIXES.GLOBAL_ADMIN).toBe("admin");
    });

    test("global admin room is admin:global", () => {
        expect(GLOBAL_ADMIN_ROOM).toBe("admin:global");
    });
});
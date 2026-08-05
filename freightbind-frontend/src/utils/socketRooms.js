// Mirrors backend helpers/socketRooms.js exactly — the room name builders the
// client uses to join/leave shipment rooms. Never hardcode a room string
// elsewhere; build it through here so both sides can never drift.

export const ROOM_PREFIXES = Object.freeze({
  USER: "user",
  ROLE: "role",
  SHIPMENT: "shipment",
  GLOBAL_ADMIN: "admin",
});

const MONGO_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const toRoomId = (value) => String(value);

const isValidMongoId = (value) => MONGO_ID_PATTERN.test(toRoomId(value));

export const buildShipmentRoom = (shipmentId) => {
  if (!isValidMongoId(shipmentId)) {
    throw new Error("Invalid shipment id for socket room");
  }
  return `${ROOM_PREFIXES.SHIPMENT}:${toRoomId(shipmentId)}`;
};

export const isShipmentRoom = (room) =>
  typeof room === "string" &&
  room.startsWith(`${ROOM_PREFIXES.SHIPMENT}:`) &&
  isValidMongoId(room.slice(ROOM_PREFIXES.SHIPMENT.length + 1));

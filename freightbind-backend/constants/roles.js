const ROLES = Object.freeze({
  ADMIN: "Admin",
  LOGISTICS_DIRECTOR: "Logistics Director",
  CARRIER_DISPATCHER: "Carrier Dispatcher",
  HUB_OPERATOR: "Hub Operator",
});

const ROLES_LIST = Object.values(ROLES);

module.exports = { ROLES, ROLES_LIST };
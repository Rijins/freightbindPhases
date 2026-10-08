// OpenAPI 3.0 specification for the FreightBind AI backend.
// Built from a route table that mirrors app.js + every router, so the docs
// can never drift from the actual endpoints. Served by Swagger UI at
// /api-docs. Every response uses the envelope `{ success, message, data, errors }`.

const SECURITY = (roles) => {
  if (!roles || roles.length === 0) return [];
  return [{ bearerAuth: [] }];
};

const errorResponse = (code, description) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } },
  },
});

const jsonBody = (schemaRef) => ({
  required: true,
  content: {
    "application/json": { schema: { $ref: `#/components/schemas/${schemaRef}` } },
  },
});

const okResponse = (description, schemaRef) => {
  const response = {
    description,
    content: {
      "application/json": {
        schema: schemaRef ? { $ref: `#/components/schemas/${schemaRef}` } : { $ref: "#/components/schemas/ApiEnvelope" },
      },
    },
  };
  return response;
};

const buildPathItem = ({
  method,
  summary,
  tags,
  security = true,
  roles = [],
  params = [],
  body = null,
  ok = "Successful response",
  okSchema = null,
  codes = { 400: "Validation error", 401: "Not authenticated", 403: "Forbidden", 404: "Not found" },
}) => {
  const item = {
    summary,
    tags,
    ...(security ? { security: SECURITY(roles) } : {}),
    responses: {
      "200": okResponse(ok, okSchema),
      ...Object.fromEntries(Object.entries(codes).map(([code, desc]) => [code, errorResponse(Number(code), desc)])),
    },
  };
  if (params.length) item.parameters = params;
  if (body) item.requestBody = jsonBody(body);
  if (method === "post" || method === "put" || method === "patch") {
    // creation endpoints return 201 in practice; document both
    if (method === "post" && okSchema) {
      item.responses["201"] = okResponse("Created", okSchema);
    }
  }
  return item;
};

const pageParam = (name, description, extra = {}) => ({
  name,
  in: "query",
  required: false,
  description,
  schema: { type: "string", ...extra },
});

const pathIdParam = (name, description, extra = {}) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", ...extra },
});

const paths = {};

const add = (method, path, options) => {
  if (!paths[path]) paths[path] = {};
  paths[path][method] = buildPathItem({ method, ...options });
};

// ---------------- System ----------------
add("get", "/api/health", {
  summary: "Health check",
  tags: ["System"],
  security: false,
  ok: "API is running",
  okSchema: "HealthResponse",
});

// ---------------- Auth ----------------
add("post", "/api/auth/register", {
  summary: "Register a new user (public)",
  tags: ["Auth"],
  security: false,
  body: "RegisterBody",
  okSchema: "AuthResponse",
  codes: { 400: "Validation error", 409: "Email already in use" },
});
add("post", "/api/auth/login", {
  summary: "Login and receive a JWT",
  tags: ["Auth"],
  security: false,
  body: "LoginBody",
  okSchema: "AuthResponse",
  codes: { 400: "Validation error", 401: "Invalid credentials" },
});
add("post", "/api/auth/logout", { summary: "Logout (clears cookie)", tags: ["Auth"], okSchema: "ApiEnvelope" });
add("get", "/api/auth/me", { summary: "Get the authenticated user", tags: ["Auth"], okSchema: "UserResponse" });
add("put", "/api/auth/update-profile", { summary: "Update own profile", tags: ["Auth"], body: "UpdateProfileBody", okSchema: "UserResponse" });
add("put", "/api/auth/change-password", { summary: "Change own password", tags: ["Auth"], body: "ChangePasswordBody", okSchema: "ApiEnvelope" });

// ---------------- Users (Admin) ----------------
add("get", "/api/users", {
  summary: "List users (Admin only)",
  tags: ["Users"],
  roles: ["Admin"],
  params: [pageParam("search", "Search name/email/phone"), pageParam("role", "Filter by role"), pageParam("status", "Filter by status"), pageParam("page", "Page number", { type: "integer" }), pageParam("limit", "Page size", { type: "integer" })],
  okSchema: "UserListResponse",
});
add("post", "/api/users", { summary: "Create a user (Admin only)", tags: ["Users"], roles: ["Admin"], body: "CreateUserBody", okSchema: "UserResponse" });
add("get", "/api/users/dispatchers", { summary: "List active Carrier Dispatchers (Admin + Logistics Director)", tags: ["Users"], roles: ["Admin", "Logistics Director"], okSchema: "UserListResponse" });
add("get", "/api/users/hub-operators", { summary: "List hub operators (Admin only)", tags: ["Users"], roles: ["Admin"], okSchema: "UserListResponse" });
add("get", "/api/users/:id", { summary: "Get a user (Admin only)", tags: ["Users"], roles: ["Admin"], params: [pathIdParam("id", "User ObjectId")], okSchema: "UserResponse" });
add("put", "/api/users/:id", { summary: "Update a user (Admin only)", tags: ["Users"], roles: ["Admin"], params: [pathIdParam("id", "User ObjectId")], body: "UpdateUserBody", okSchema: "UserResponse" });
add("patch", "/api/users/:id/status", { summary: "Activate/deactivate a user (Admin only)", tags: ["Users"], roles: ["Admin"], params: [pathIdParam("id", "User ObjectId")], body: "UserStatusBody", okSchema: "UserResponse" });

// ---------------- Shipments ----------------
add("get", "/api/v1/shipments", {
  summary: "List shipments (role-scoped)",
  tags: ["Shipments"],
  params: [
    pageParam("search", "Search shipmentId/title/origin/destination/container/vehicle"),
    pageParam("status", "Filter by status"), pageParam("priority", "Filter by priority"),
    pageParam("cargoType", "Filter by cargo type"), pageParam("shipmentType", "Filter by shipment type"),
    pageParam("origin", "Filter by origin"), pageParam("destination", "Filter by destination"),
    pageParam("createdBy", "Filter by creator"), pageParam("assignedDispatcher", "Filter by dispatcher"),
    pageParam("hub", "Filter by hub"), pageParam("sortBy", "Sort field"),
    pageParam("order", "asc | desc"), pageParam("page", "Page number", { type: "integer" }),
    pageParam("limit", "Page size", { type: "integer" }),
  ],
  okSchema: "ShipmentListResponse",
});
add("post", "/api/v1/shipments", { summary: "Create a shipment (Admin + Logistics Director)", tags: ["Shipments"], roles: ["Admin", "Logistics Director"], body: "CreateShipmentBody", okSchema: "ShipmentResponse" });
add("get", "/api/v1/shipments/:id", { summary: "Get a shipment by id", tags: ["Shipments"], params: [pathIdParam("id", "Shipment ObjectId")], okSchema: "ShipmentResponse" });
add("put", "/api/v1/shipments/:id", { summary: "Update a shipment (role + hub scoped)", tags: ["Shipments"], params: [pathIdParam("id", "Shipment ObjectId")], body: "UpdateShipmentBody", okSchema: "ShipmentResponse" });
add("delete", "/api/v1/shipments/:id", { summary: "Delete a shipment (Admin + Logistics Director)", tags: ["Shipments"], roles: ["Admin", "Logistics Director"], params: [pathIdParam("id", "Shipment ObjectId")], okSchema: "ApiEnvelope", codes: { 400: "Validation error", 401: "Not authenticated", 403: "Forbidden", 404: "Shipment not found" } });

// ---------------- Timeline ----------------
add("get", "/api/timeline/:shipmentId", { summary: "Get a shipment timeline", tags: ["Timeline"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], okSchema: "TimelineResponse" });
add("get", "/api/timeline/:shipmentId/latest", { summary: "Get the latest timeline event", tags: ["Timeline"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], okSchema: "TimelineResponse" });
add("post", "/api/timeline/status", { summary: "Update shipment status (creates timeline event)", tags: ["Timeline"], body: "UpdateStatusBody", okSchema: "TimelineResponse" });
add("post", "/api/timeline/location", { summary: "Update shipment location (creates timeline event)", tags: ["Timeline"], body: "UpdateLocationBody", okSchema: "TimelineResponse" });
add("post", "/api/timeline/dispatcher", { summary: "Assign a dispatcher (creates timeline event)", tags: ["Timeline"], body: "AssignDispatcherBody", okSchema: "TimelineResponse" });
add("post", "/api/timeline/note", { summary: "Add a timeline note", tags: ["Timeline"], body: "AddNoteBody", okSchema: "TimelineResponse" });

// ---------------- Notifications ----------------
add("get", "/api/notifications", { summary: "List the caller's notifications", tags: ["Notifications"], params: [pageParam("page", "Page number", { type: "integer" }), pageParam("limit", "Page size", { type: "integer" }), pageParam("unreadOnly", "Filter to unread only")], okSchema: "NotificationListResponse" });
add("post", "/api/notifications", { summary: "Create a notification (Admin + Logistics Director)", tags: ["Notifications"], roles: ["Admin", "Logistics Director"], body: "CreateNotificationBody", okSchema: "NotificationResponse" });
add("get", "/api/notifications/unread-count", { summary: "Unread count for the caller", tags: ["Notifications"], okSchema: "UnreadCountResponse" });
add("patch", "/api/notifications/read-all", { summary: "Mark all as read", tags: ["Notifications"], okSchema: "ApiEnvelope" });
add("delete", "/api/notifications/read", { summary: "Delete all read notifications", tags: ["Notifications"], okSchema: "ApiEnvelope" });
add("get", "/api/notifications/:id", { summary: "Get a notification", tags: ["Notifications"], params: [pathIdParam("id", "Notification ObjectId")], okSchema: "NotificationResponse" });
add("delete", "/api/notifications/:id", { summary: "Delete a notification", tags: ["Notifications"], params: [pathIdParam("id", "Notification ObjectId")], okSchema: "ApiEnvelope" });
add("patch", "/api/notifications/:id/read", { summary: "Mark a notification as read", tags: ["Notifications"], params: [pathIdParam("id", "Notification ObjectId")], okSchema: "NotificationResponse" });

// ---------------- Announcements ----------------
add("get", "/api/announcements", { summary: "List announcements (date-window filtered)", tags: ["Announcements"], okSchema: "AnnouncementListResponse" });
add("post", "/api/announcements", { summary: "Create an announcement (Admin only)", tags: ["Announcements"], roles: ["Admin"], body: "CreateAnnouncementBody", okSchema: "AnnouncementResponse" });
add("get", "/api/announcements/:id", { summary: "Get an announcement", tags: ["Announcements"], params: [pathIdParam("id", "Announcement ObjectId")], okSchema: "AnnouncementResponse" });
add("put", "/api/announcements/:id", { summary: "Update an announcement (Admin only)", tags: ["Announcements"], roles: ["Admin"], params: [pathIdParam("id", "Announcement ObjectId")], body: "UpdateAnnouncementBody", okSchema: "AnnouncementResponse" });
add("delete", "/api/announcements/:id", { summary: "Delete an announcement (Admin only)", tags: ["Announcements"], roles: ["Admin"], params: [pathIdParam("id", "Announcement ObjectId")], okSchema: "ApiEnvelope" });
add("patch", "/api/announcements/:id/status", { summary: "Set announcement status (Admin only)", tags: ["Announcements"], roles: ["Admin"], params: [pathIdParam("id", "Announcement ObjectId")], body: "AnnouncementStatusBody", okSchema: "AnnouncementResponse" });

// ---------------- Hubs ----------------
add("get", "/api/hubs", { summary: "List hubs (Admin + Logistics Director)", tags: ["Hubs"], roles: ["Admin", "Logistics Director"], params: [pageParam("search", "Search name/location"), pageParam("type", "Filter type"), pageParam("status", "Filter status"), pageParam("page", "Page number", { type: "integer" }), pageParam("limit", "Page size", { type: "integer" })], okSchema: "HubListResponse" });
add("post", "/api/hubs", { summary: "Create a hub (Admin only)", tags: ["Hubs"], roles: ["Admin"], body: "CreateHubBody", okSchema: "HubResponse" });
add("get", "/api/hubs/my", { summary: "The caller's own hub (Hub Operators)", tags: ["Hubs"], okSchema: "HubResponse", codes: { 401: "Not authenticated", 404: "No hub assigned" } });
add("get", "/api/hubs/:id", { summary: "Get a hub (Admin + Logistics Director)", tags: ["Hubs"], roles: ["Admin", "Logistics Director"], params: [pathIdParam("id", "Hub ObjectId")], okSchema: "HubResponse" });
add("put", "/api/hubs/:id", { summary: "Update a hub (Admin only)", tags: ["Hubs"], roles: ["Admin"], params: [pathIdParam("id", "Hub ObjectId")], body: "UpdateHubBody", okSchema: "HubResponse" });
add("get", "/api/hubs/:id/operators", { summary: "List operators of a hub (Admin only)", tags: ["Hubs"], roles: ["Admin"], params: [pathIdParam("id", "Hub ObjectId")], okSchema: "HubOperatorsResponse" });
add("patch", "/api/hubs/:id/status", { summary: "Activate/deactivate a hub (Admin only)", tags: ["Hubs"], roles: ["Admin"], params: [pathIdParam("id", "Hub ObjectId")], body: "HubStatusBody", okSchema: "HubResponse" });

// ---------------- Chat ----------------
add("get", "/api/chat/shipments/:shipmentId", { summary: "Get chat context for a shipment", tags: ["Chat"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], okSchema: "ChatContextResponse" });
add("get", "/api/chat/shipments/:shipmentId/messages", { summary: "List chat messages for a shipment", tags: ["Chat"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], okSchema: "ChatMessageListResponse" });
add("post", "/api/chat/shipments/:shipmentId/messages", { summary: "Send a chat message", tags: ["Chat"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], body: "SendMessageBody", okSchema: "ChatMessageResponse" });

// ---------------- AI ----------------
add("post", "/api/ai/delay-risk/:shipmentId", { summary: "Delay-risk prediction for a shipment", tags: ["AI"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], body: "AIBody", okSchema: "DelayRiskResponse", codes: { 400: "Validation error", 401: "Not authenticated", 404: "Shipment not found", 502: "AI provider error" } });
add("post", "/api/ai/shipment-summary/:shipmentId", { summary: "AI shipment summary", tags: ["AI"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], body: "AIBody", okSchema: "SummaryResponse", codes: { 400: "Validation error", 401: "Not authenticated", 404: "Shipment not found", 502: "AI provider error" } });
add("post", "/api/ai/recommendations/:shipmentId", { summary: "AI recommendations for a shipment", tags: ["AI"], params: [pathIdParam("shipmentId", "Shipment ObjectId")], body: "AIBody", okSchema: "RecommendationsResponse", codes: { 400: "Validation error", 401: "Not authenticated", 404: "Shipment not found", 502: "AI provider error" } });

// ---------------- Analytics ----------------
add("get", "/api/analytics/dashboard", {
  summary: "Real dashboard analytics (role-scoped)",
  tags: ["Analytics"],
  roles: ["Admin", "Logistics Director", "Carrier Dispatcher", "Hub Operator"],
  okSchema: "AnalyticsResponse",
});

// ================= Components =================
const components = {
  securitySchemes: {
    bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
  },
  schemas: {
    ApiEnvelope: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        data: {},
        errors: { type: "array", items: { type: "object" } },
      },
    },
    ErrorEnvelope: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: { type: "string" },
        errors: { type: "array", items: { type: "object" } },
      },
    },
    HealthResponse: {
      type: "object",
      properties: {
        data: { type: "object", properties: { uptime: { type: "number" } } },
      },
    },
    RegisterBody: {
      type: "object",
      required: ["fullName", "email", "password", "role"],
      properties: {
        fullName: { type: "string" },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
        phone: { type: "string" },
        role: { type: "string", enum: ["Admin", "Logistics Director", "Carrier Dispatcher", "Hub Operator"] },
        hub: { type: "string", format: "object-id" },
      },
    },
    LoginBody: {
      type: "object",
      required: ["email", "password"],
      properties: { email: { type: "string", format: "email" }, password: { type: "string" } },
    },
    AuthResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
      },
    },
    User: {
      type: "object",
      properties: {
        _id: { type: "string" },
        fullName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        role: { type: "string" },
        status: { type: "string" },
        hub: { oneOf: [{ type: "string", format: "object-id" }, { type: "object" }] },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },
    UserResponse: { type: "object", properties: { data: { properties: { user: { $ref: "#/components/schemas/User" } } } } },
    UserListResponse: { type: "object", properties: { data: { properties: { users: { type: "array", items: { $ref: "#/components/schemas/User" } }, pagination: { type: "object" } } } } },
    CreateUserBody: {
      type: "object",
      required: ["fullName", "email", "password", "role"],
      properties: { fullName: { type: "string" }, email: { type: "string" }, password: { type: "string" }, role: { type: "string" }, hub: { type: "string" }, phone: { type: "string" } },
    },
    UpdateUserBody: {
      type: "object",
      properties: { fullName: { type: "string" }, email: { type: "string" }, role: { type: "string" }, hub: { type: "string" }, phone: { type: "string" } },
    },
    UserStatusBody: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["active", "inactive"] } } },
    UpdateProfileBody: { type: "object", properties: { fullName: { type: "string" }, phone: { type: "string" } } },
    ChangePasswordBody: { type: "object", required: ["currentPassword", "newPassword"], properties: { currentPassword: { type: "string" }, newPassword: { type: "string" } } },

    Shipment: {
      type: "object",
      properties: {
        _id: { type: "string" },
        shipmentId: { type: "string" },
        title: { type: "string" },
        cargoType: { type: "string" },
        shipmentType: { type: "string" },
        origin: { type: "string" },
        destination: { type: "string" },
        currentLocation: { type: "string" },
        priority: { type: "string" },
        status: { type: "string" },
        assignedDispatcher: { type: "object" },
        hub: { type: "object" },
        weight: { type: "number" },
        vehicleNumber: { type: "string" },
        containerNumber: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
      },
    },
    ShipmentResponse: { type: "object", properties: { data: { properties: { shipment: { $ref: "#/components/schemas/Shipment" } } } } },
    ShipmentListResponse: { type: "object", properties: { data: { properties: { shipments: { type: "array", items: { $ref: "#/components/schemas/Shipment" } }, pagination: { type: "object" } } } } },
    CreateShipmentBody: {
      type: "object",
      required: ["title", "cargoType", "shipmentType", "origin", "destination", "priority"],
      properties: {
        title: { type: "string" }, description: { type: "string" }, cargoType: { type: "string" },
        shipmentType: { type: "string" }, origin: { type: "string" }, destination: { type: "string" },
        priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
        assignedDispatcher: { type: "string" }, hub: { type: "string" },
        estimatedDeparture: { type: "string", format: "date-time" }, estimatedArrival: { type: "string", format: "date-time" },
        weight: { type: "number" }, containerNumber: { type: "string" }, vehicleNumber: { type: "string" }, notes: { type: "string" },
      },
    },
    UpdateShipmentBody: {
      type: "object",
      properties: {
        title: { type: "string" }, description: { type: "string" }, cargoType: { type: "string" },
        shipmentType: { type: "string" }, origin: { type: "string" }, destination: { type: "string" },
        priority: { type: "string" }, status: { type: "string" },
        assignedDispatcher: { type: "string" }, hub: { type: "string" },
        estimatedDeparture: { type: "string", format: "date-time" }, estimatedArrival: { type: "string", format: "date-time" },
        actualDeparture: { type: "string", format: "date-time" }, actualArrival: { type: "string", format: "date-time" },
        weight: { type: "number" }, containerNumber: { type: "string" }, vehicleNumber: { type: "string" }, notes: { type: "string" },
      },
    },
    TimelineResponse: { type: "object", properties: { data: { properties: { events: { type: "array" }, event: { type: "object" }, shipment: { type: "object" } } } } },
    UpdateStatusBody: { type: "object", required: ["shipmentId", "status"], properties: { shipmentId: { type: "string" }, status: { type: "string" } } },
    UpdateLocationBody: { type: "object", required: ["shipmentId", "currentLocation"], properties: { shipmentId: { type: "string" }, currentLocation: { type: "string" } } },
    AssignDispatcherBody: { type: "object", required: ["shipmentId", "dispatcherId"], properties: { shipmentId: { type: "string" }, dispatcherId: { type: "string" } } },
    AddNoteBody: { type: "object", required: ["shipmentId", "note"], properties: { shipmentId: { type: "string" }, note: { type: "string" } } },

    Notification: { type: "object", properties: { _id: { type: "string" }, type: { type: "string" }, title: { type: "string" }, body: { type: "string" }, read: { type: "boolean" }, createdAt: { type: "string" } } },
    NotificationResponse: { type: "object", properties: { data: { properties: { notification: { $ref: "#/components/schemas/Notification" } } } } },
    NotificationListResponse: { type: "object", properties: { data: { properties: { notifications: { type: "array", items: { $ref: "#/components/schemas/Notification" } }, pagination: { type: "object" } } } } },
    UnreadCountResponse: { type: "object", properties: { data: { properties: { unreadCount: { type: "integer" } } } } },
    CreateNotificationBody: { type: "object", required: ["type", "title", "body", "recipients"], properties: { type: { type: "string" }, title: { type: "string" }, body: { type: "string" }, recipients: { type: "array", items: { type: "string" } } } },

    Announcement: { type: "object", properties: { _id: { type: "string" }, title: { type: "string" }, content: { type: "string" }, status: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, createdAt: { type: "string" } } },
    AnnouncementResponse: { type: "object", properties: { data: { properties: { announcement: { $ref: "#/components/schemas/Announcement" } } } } },
    AnnouncementListResponse: { type: "object", properties: { data: { properties: { announcements: { type: "array", items: { $ref: "#/components/schemas/Announcement" } } } } } },
    CreateAnnouncementBody: { type: "object", required: ["title", "content"], properties: { title: { type: "string" }, content: { type: "string" }, status: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } } },
    UpdateAnnouncementBody: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } } },
    AnnouncementStatusBody: { type: "object", required: ["status"], properties: { status: { type: "string" } } },

    Hub: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" }, location: { type: "string" }, type: { type: "string" }, status: { type: "string" }, capacity: { type: "number" }, createdAt: { type: "string" } } },
    HubResponse: { type: "object", properties: { data: { properties: { hub: { $ref: "#/components/schemas/Hub" } } } } },
    HubListResponse: { type: "object", properties: { data: { properties: { hubs: { type: "array", items: { $ref: "#/components/schemas/Hub" } }, pagination: { type: "object" } } } } },
    CreateHubBody: { type: "object", required: ["name", "location", "type"], properties: { name: { type: "string" }, location: { type: "string" }, type: { type: "string", enum: ["Port", "Yard", "Warehouse", "Distribution"] }, status: { type: "string", enum: ["active", "inactive"] }, capacity: { type: "number" } } },
    UpdateHubBody: { type: "object", properties: { name: { type: "string" }, location: { type: "string" }, type: { type: "string" }, status: { type: "string" }, capacity: { type: "number" } } },
    HubStatusBody: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["active", "inactive"] } } },
    HubOperatorsResponse: { type: "object", properties: { data: { properties: { hub: { $ref: "#/components/schemas/Hub" }, operators: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } },

    ChatContextResponse: { type: "object", properties: { data: { properties: { shipment: { type: "object" }, participants: { type: "array" } } } } },
    ChatMessage: { type: "object", properties: { _id: { type: "string" }, shipment: { type: "string" }, sender: { type: "object" }, content: { type: "string" }, createdAt: { type: "string" } } },
    ChatMessageResponse: { type: "object", properties: { data: { properties: { message: { $ref: "#/components/schemas/ChatMessage" } } } } },
    ChatMessageListResponse: { type: "object", properties: { data: { properties: { messages: { type: "array", items: { $ref: "#/components/schemas/ChatMessage" } } } } } },
    SendMessageBody: { type: "object", required: ["content"], properties: { content: { type: "string" } } },

    AIBody: { type: "object", properties: {} },
    DelayRiskResponse: { type: "object", properties: { data: { properties: { risk: { type: "string", enum: ["Low", "Medium", "High"] }, confidence: { type: "number" }, summary: { type: "string" }, recommendations: { type: "array" } } } } },
    SummaryResponse: { type: "object", properties: { data: { properties: { overview: { type: "string" }, milestones: { type: "array" }, currentProgress: { type: "string" }, concerns: { type: "array" }, nextAction: { type: "string" } } } } },
    RecommendationsResponse: { type: "object", properties: { data: { properties: { recommendations: { type: "array" } } } } },

    AnalyticsResponse: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            fleet: { type: "object", properties: { vehicles: { type: "array" }, available: { type: "integer" }, totalVehicles: { type: "integer" }, availabilityPct: { type: "integer" } } },
            hubs: { type: "object", properties: { hubs: { type: "array" }, overallUtilization: { type: "number" } } },
            volumeTrend: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "integer" } } } },
            system: { type: "object", properties: { uptime: { type: "number" }, environment: { type: "string" }, services: { type: "array" }, overall: { type: "string" } } },
          },
        },
      },
    },
  },
};

module.exports = {
  openapi: "3.0.0",
  info: {
    title: "FreightBind AI API",
    version: "1.0.0",
    description:
      "REST + Socket.IO API for the FreightBind AI logistics platform. Protected routes authenticate with a JWT Bearer token (or httponly cookie) issued by POST /api/auth/login. All responses use the envelope `{ success, message, data, errors }`.",
  },
  servers: [{ url: "http://localhost:5000", description: "Local development server" }],
  tags: [
    { name: "System", description: "Health checks" },
    { name: "Auth", description: "Authentication and profile" },
    { name: "Users", description: "User administration (Admin)" },
    { name: "Shipments", description: "Shipment CRUD and queries" },
    { name: "Timeline", description: "Append-only shipment timeline" },
    { name: "Notifications", description: "User-scoped notifications" },
    { name: "Announcements", description: "System announcements" },
    { name: "Hubs", description: "Operational hub management" },
    { name: "Chat", description: "Shipment realtime chat" },
    { name: "AI", description: "AI-assisted analytics" },
    { name: "Analytics", description: "Real dashboard analytics" },
  ],
  paths,
  components,
};
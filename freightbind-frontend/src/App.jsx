import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Loader from "./components/Loader/Loader";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { getToken } from "./utils/storage";
import { CAN_CREATE_SHIPMENT_ROLES, CAN_MANAGE_USERS_ROLES, CAN_MANAGE_HUBS_ROLES, ROLES } from "./utils/constants";
import useAuth from "./hooks/useAuth";

// Pages are code-split per route; the layout, guards and auth slice stay eager.
const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome"));
const ShipmentList = lazy(() => import("./pages/Shipments/ShipmentList"));
const CreateShipment = lazy(() => import("./pages/CreateShipment/CreateShipment"));
const EditShipment = lazy(() => import("./pages/EditShipment/EditShipment"));
const ShipmentDetails = lazy(() => import("./pages/ShipmentDetails/ShipmentDetails"));
const ShipmentTimeline = lazy(() => import("./pages/timeline/ShipmentTimeline"));
const ShipmentChat = lazy(() => import("./pages/chat/ShipmentChat"));
const HubsManagement = lazy(() => import("./pages/hubs/HubsManagement"));
const HubOperationsWorkspace = lazy(() => import("./pages/hubOperations/HubOperationsWorkspace"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const UserManagement = lazy(() => import("./pages/users/UserManagement"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const Announcements = lazy(() => import("./pages/announcements/Announcements"));

/**
 * On first load, if a token is already stored, verify it against the backend
 * (GET /api/auth/me) before rendering protected routes. Never trust a stored
 * token blindly — the backend remains the source of truth for validity.
 */
const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [checkingSession, setCheckingSession] = useState(Boolean(getToken()));

  useEffect(() => {
    if (getToken()) {
      dispatch(fetchCurrentUser()).finally(() => setCheckingSession(false));
    }
  }, [dispatch]);

  if (checkingSession) {
    return <Loader fullPage label="Loading FreightBind AI..." />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loader fullPage label="Loading FreightBind AI..." />}>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public marketing page. Authenticated users keep today's redirect to the dashboard. */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/shipments" element={<ShipmentList />} />
              <Route path="/shipments/:id" element={<ShipmentDetails />} />
              <Route path="/shipments/:id/timeline" element={<ShipmentTimeline />} />
              <Route path="/shipments/:id/chat" element={<ShipmentChat />} />
              <Route path="/shipments/edit/:id" element={<EditShipment />} />

              <Route element={<RoleRoute allowedRoles={CAN_CREATE_SHIPMENT_ROLES} />}>
                <Route path="/shipments/create" element={<CreateShipment />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={CAN_MANAGE_USERS_ROLES} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={CAN_MANAGE_HUBS_ROLES} />}>
                <Route path="/hubs" element={<HubsManagement />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={[ROLES.HUB_OPERATOR]} />}>
                <Route path="/hub-operations" element={<HubOperationsWorkspace />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
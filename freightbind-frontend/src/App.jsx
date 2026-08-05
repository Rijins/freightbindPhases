import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Loader from "./components/Loader/Loader";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { getToken } from "./utils/storage";
import { CAN_CREATE_SHIPMENT_ROLES } from "./utils/constants";

// Pages are code-split per route; the layout, guards and auth slice stay eager.
const Login = lazy(() => import("./pages/Login/Login"));
const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome"));
const ShipmentList = lazy(() => import("./pages/Shipments/ShipmentList"));
const CreateShipment = lazy(() => import("./pages/CreateShipment/CreateShipment"));
const EditShipment = lazy(() => import("./pages/EditShipment/EditShipment"));
const ShipmentDetails = lazy(() => import("./pages/ShipmentDetails/ShipmentDetails"));
const ShipmentTimeline = lazy(() => import("./pages/timeline/ShipmentTimeline"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));

/**
 * On first load, if a token is already stored, verify it against the backend
 * (GET /api/auth/me) before rendering protected routes. Never trust a stored
 * token blindly — the backend remains the source of truth for validity.
 */
const App = () => {
  const dispatch = useDispatch();
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
      <Suspense fallback={<Loader fullPage label="Loading FreightBind AI..." />}>
        <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/shipments" element={<ShipmentList />} />
            <Route path="/shipments/:id" element={<ShipmentDetails />} />
            <Route path="/shipments/:id/timeline" element={<ShipmentTimeline />} />
            <Route path="/shipments/edit/:id" element={<EditShipment />} />

            <Route element={<RoleRoute allowedRoles={CAN_CREATE_SHIPMENT_ROLES} />}>
              <Route path="/shipments/create" element={<CreateShipment />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
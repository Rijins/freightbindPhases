import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Footer from "../components/Footer/Footer";
import ConnectionStatus from "../components/ConnectionStatus/ConnectionStatus";
import RealtimeNotificationToast from "../components/notifications/RealtimeNotificationToast";
import useRealtimeNotifications from "../hooks/useRealtimeNotifications";
import useRealtimeShipments from "../hooks/useRealtimeShipments";

const SIDEBAR_COLLAPSED_KEY = "freightbind_sidebar_collapsed";

const getInitialCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * The one shared shell for every authenticated page. Future pages only need a
 * route inside the layout — they automatically inherit sidebar, navbar,
 * breadcrumb, page transitions, and footer.
 */
const AppLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialCollapsed);
  const location = useLocation();
  const mainRef = useRef(null);

  // Mount the realtime notification listeners once, for the lifetime of the
  // authenticated shell (badge + lists update without page refresh).
  useRealtimeNotifications();

  // Mount the realtime shipment/timeline listeners once (list + detail + live
  // timeline sync, reconnect recovery).
  useRealtimeShipments();

  // New route → content area starts from the top.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const handleToggleCollapsed = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Storage can be unavailable in private/embedded contexts — never crash.
      }
      return next;
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          collapsed={sidebarCollapsed}
          onCollapse={handleToggleCollapsed}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onToggleSidebar={() => setMobileNavOpen(true)} />
          <Breadcrumb />
          <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <ConnectionStatus />
      <RealtimeNotificationToast />
    </MotionConfig>
  );
};

export default AppLayout;

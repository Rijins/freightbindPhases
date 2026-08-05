import React, { useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationBadge from './NotificationBadge';
import NotificationDrawer from './NotificationDrawer';
import useNotifications from '../../hooks/useNotifications';
import { useRoleTheme } from '../../contexts/RoleThemeContext';

const NotificationBell = () => {
  const { unreadCount, drawerOpen, actions } = useNotifications();
  const roleTheme = useRoleTheme();
  const buttonRef = useRef(null);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        !event.target.closest('.notification-drawer')
      ) {
        actions.toggleDrawer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen, actions]);

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={() => actions.toggleDrawer(!drawerOpen)}
        className={`relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-200 ${roleTheme.primary.ring}`}
        aria-label="Notifications"
      >
        <FiBell className="h-5 w-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Drawer Portal/Overlay */}
      {drawerOpen && (
        <div className="notification-drawer absolute right-0 top-full z-50 mt-2 w-80 sm:w-96">
          <NotificationDrawer onClose={() => actions.toggleDrawer(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

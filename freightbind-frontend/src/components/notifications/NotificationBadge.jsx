import React from 'react';
import { useRoleTheme } from '../../contexts/RoleThemeContext';

const NotificationBadge = ({ count }) => {
  const roleTheme = useRoleTheme();

  // FIX: Safely extract number from potential API wrapper object
  const actualCount = typeof count === 'number'
    ? count
    : (count?.data ?? count?.count ?? 0);

  if (!actualCount || actualCount <= 0) return null;

  const displayCount = actualCount > 99 ? '99+' : actualCount;

  return (
    <span
      className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse dark:ring-zinc-900 ${roleTheme.primary.solidBg}`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;

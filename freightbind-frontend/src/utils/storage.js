import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./constants";

// Single source of truth for reading/writing auth persistence.
// Never access localStorage directly anywhere else in the app.

export const saveToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

export const saveUser = (user) => {
  if (!user) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const removeUser = () => localStorage.removeItem(USER_STORAGE_KEY);

export const clearAuthStorage = () => {
  removeToken();
  removeUser();
};

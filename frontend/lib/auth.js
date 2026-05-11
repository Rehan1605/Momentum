const TOKEN_KEY = "momentum_token";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const setToken = (token) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

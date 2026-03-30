// utils/auth.js

export const getToken = () => localStorage.getItem("token");

export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const setTokens = (token, refreshToken) => {
  if (token) localStorage.setItem("token", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const getRole = () => {
  const roles = localStorage.getItem("roles");
  return roles ? JSON.parse(roles)[0] : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("roles");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

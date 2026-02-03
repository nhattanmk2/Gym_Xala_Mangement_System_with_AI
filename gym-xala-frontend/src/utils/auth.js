// utils/auth.js
export const getToken = () => localStorage.getItem("token");

export const getRole = () => {
  const roles = localStorage.getItem("roles");
  return roles ? JSON.parse(roles)[0] : null;
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};


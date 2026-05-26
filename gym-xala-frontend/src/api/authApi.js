import axiosClient from "./axiosClient";
import { setTokens } from "../utils/auth";

// LOGIN
export const login = async (username, password) => {
  const res = await axiosClient.post(`/auth/login`, {
    username,
    password});
  
  if (res.data && res.data.token) {
      setTokens(res.data.token, res.data.refreshToken);
  }
  
  return res.data;
};

// REGISTER MEMBER
export const registerMember = async (data) => {
  const res = await axiosClient.post(`/auth/register/member`, data);
  return res.data;
};

// VERIFY ACCOUNT
export const verifyAccount = async (data) => {
  const res = await axiosClient.post(`/auth/register/verify`, data);
  return res.data;
};

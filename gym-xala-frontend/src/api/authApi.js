import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

// LOGIN
export const login = async (username, password) => {
  const res = await axios.post(`${BASE_URL}/login`, {
    username,
    password,
  });
  return res.data;
};

// REGISTER MEMBER
export const registerMember = async (data) => {
  const res = await axios.post(`${BASE_URL}/register/member`, data);
  return res.data;
};

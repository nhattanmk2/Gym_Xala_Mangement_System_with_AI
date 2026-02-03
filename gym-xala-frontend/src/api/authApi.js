import axios from "axios";

export const login = async (username, password) => {
  const res = await axios.post(
    "http://localhost:8080/api/auth/login",
    { username, password }
  );
  return res.data;
};

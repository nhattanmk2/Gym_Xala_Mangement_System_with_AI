import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api/member";

// GET PROFILE
export const getProfile = async () => {
  const token = getToken();

  const res = await axios.get(`${BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

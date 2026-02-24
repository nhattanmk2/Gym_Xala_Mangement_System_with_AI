import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api/admin/members";

export const getAllMembers = async (name = "", cccd = "") => {
  const token = getToken();

  const res = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      name,
      cccd,
    },
  });

  return res.data;
};
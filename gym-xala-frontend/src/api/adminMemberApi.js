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

export const updateMember = async (id, data) => {
  const token = getToken();

  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateMemberStatus = async (id, status) => {
  const token = getToken();
  const res = await axios.put(`${BASE_URL}/${id}/status`, null, {
    headers: { Authorization: `Bearer ${token}` },
    params: { status }
  });
  return res.data;
};

export const deleteMember = async (id) => {
  const token = getToken();
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createMember = async (data) => {
  const token = getToken();
  const res = await axios.post(`${BASE_URL}/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
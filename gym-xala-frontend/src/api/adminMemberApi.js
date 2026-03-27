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

export const upgradeToPt = async (id) => {
  const token = getToken();
  const res = await axios.put(`${BASE_URL}/${id}/upgrade-pt`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getMemberMemberships = async (memberId) => {
  const token = getToken();
  const res = await axios.get(`${BASE_URL}/${memberId}/memberships`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getMemberAiHistory = async (memberId) => {
  const token = getToken();
  const res = await axios.get(`${BASE_URL}/${memberId}/ai-history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const approveMembership = async (membershipId, customPrice) => {
  const token = getToken();
  let url = `http://localhost:8080/api/admin/memberships/${membershipId}/approve`;
  if (customPrice != null) {
      url += `?customPrice=${customPrice}`;
  }
  const res = await axios.put(url, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

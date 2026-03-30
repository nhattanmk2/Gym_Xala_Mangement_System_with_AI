import axiosClient from "./axiosClient";

const BASE_URL = "/admin/members";

export const getAllMembers = async (name = "", cccd = "") => {
  const res = await axiosClient.get(BASE_URL, {
    params: {
      name,
      cccd,
    }});

  return res.data;
};

export const updateMember = async (id, data) => {
  const res = await axiosClient.put(`${BASE_URL}/${id}`, data);

  return res.data;
};

export const updateMemberStatus = async (id, status) => {  const res = await axiosClient.put(`${BASE_URL}/${id}/status`, null, {
    params: { status }
  });
  return res.data;
};

export const deleteMember = async (id) => {  const res = await axiosClient.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export const createMember = async (data) => {  const res = await axiosClient.post(`${BASE_URL}/create`, data);
  return res.data;
};

export const upgradeToPt = async (id) => {  const res = await axiosClient.put(`${BASE_URL}/${id}/upgrade-pt`);
  return res.data;
};

export const getMemberMemberships = async (memberId) => {  const res = await axiosClient.get(`${BASE_URL}/${memberId}/memberships`);
  return res.data;
};

export const getMemberAiHistory = async (memberId) => {  const res = await axiosClient.get(`${BASE_URL}/${memberId}/ai-history`);
  return res.data;
};

export const approveMembership = async (membershipId, customPrice) => {  let url = `/admin/memberships/${membershipId}/approve`;
  if (customPrice != null) {
      url += `?customPrice=${customPrice}`;
  }
  const res = await axiosClient.put(url);
  return res.data;
};

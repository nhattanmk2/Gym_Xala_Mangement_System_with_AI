import axiosClient from "./axiosClient";

const BASE_URL = "/member";

// GET PROFILE
export const getProfile = async () => {
  const res = await axiosClient.get(`${BASE_URL}/profile`);

  return res.data;
};

// UPDATE PROFILE
export const updateProfile = async (data) => {
  const res = await axiosClient.put(`${BASE_URL}/profile`, data);

  return res.data;
};

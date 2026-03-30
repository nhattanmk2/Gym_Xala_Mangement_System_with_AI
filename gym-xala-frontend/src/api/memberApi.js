import axiosClient from "./axiosClient";

const BASE_URL = "/member";

// GET PROFILE
export const getProfile = async () => {
  const res = await axiosClient.get(`${BASE_URL}/profile`);

  return res.data;
};

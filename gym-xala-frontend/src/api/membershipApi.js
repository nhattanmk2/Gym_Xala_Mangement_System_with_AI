import axiosClient from "./axiosClient";

const BASE_URL = "/member/packages";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const registerPackage = async (packageId, startDate) => {
    const res = await axiosClient.post(`${BASE_URL}/register`, { packageId, startDate }, getHeaders());
    return res.data;
};

export const getMyCardList = async () => {
    const res = await axiosClient.get(`${BASE_URL}/my-cards`, getHeaders());
    return res.data;
};

export const getCurrentCard = async () => {
    const res = await axiosClient.get(`${BASE_URL}/current`, getHeaders());
    return res.data;
};

export const cancelPackage = async (cardId) => {
    const res = await axiosClient.put(`${BASE_URL}/cancel/${cardId}`, {}, getHeaders());
    return res.data;
};

export const assignPt = async (cardId, ptId) => {
    const res = await axiosClient.put(`${BASE_URL}/${cardId}/assign-pt/${ptId}`, {}, getHeaders());
    return res.data;
};

export const pausePackage = async (cardId, reason = '') => {
    const res = await axiosClient.put(`${BASE_URL}/${cardId}/pause?reason=${encodeURIComponent(reason)}`, {}, getHeaders());
    return res.data;
};

export const resumePackage = async (cardId) => {
    const res = await axiosClient.put(`${BASE_URL}/${cardId}/resume`, {}, getHeaders());
    return res.data;
};

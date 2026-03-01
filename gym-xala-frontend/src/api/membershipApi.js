import axios from "axios";

const BASE_URL = "http://localhost:8080/api/member/packages";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const registerPackage = async (packageId, startDate) => {
    const res = await axios.post(`${BASE_URL}/register`, { packageId, startDate }, getHeaders());
    return res.data;
};

export const getMyCardList = async () => {
    const res = await axios.get(`${BASE_URL}/my-cards`, getHeaders());
    return res.data;
};

export const getCurrentCard = async () => {
    const res = await axios.get(`${BASE_URL}/current`, getHeaders());
    return res.data;
};

export const cancelPackage = async (cardId) => {
    const res = await axios.put(`${BASE_URL}/cancel/${cardId}`, {}, getHeaders());
    return res.data;
};

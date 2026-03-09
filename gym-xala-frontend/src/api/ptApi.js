import axios from "axios";

const BASE_URL = "http://localhost:8080/api/pt";

const getToken = () => localStorage.getItem("token");

export const getMyProfile = async () => {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateMyProfile = async (formData) => {
    const token = getToken();
    const res = await axios.put(`${BASE_URL}/profile`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const getAllPositions = async () => {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/positions`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getAllLocations = async () => {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getAllPTs = async (branchId) => {
    const token = getToken();
    const url = branchId ? `${BASE_URL}/all?branchId=${branchId}` : `${BASE_URL}/all`;
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const approveBooking = async (id) => {
    const token = getToken();
    const res = await axios.put(`${BASE_URL}/schedule/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const rejectBooking = async (id) => {
    const token = getToken();
    const res = await axios.put(`${BASE_URL}/schedule/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

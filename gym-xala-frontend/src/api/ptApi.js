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

import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api/admin/pts";

export const getAllPts = async (name = "", phone = "") => {
    const token = getToken();

    const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { name, phone },
    });

    return res.data;
};

export const deletePt = async (id) => {
    const token = getToken();
    const res = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const downgradeToMember = async (id) => {
    const token = getToken();
    const res = await axios.put(`${BASE_URL}/${id}/downgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const createPt = async (data) => {
    const token = getToken();
    const res = await axios.post(BASE_URL, data, {
        headers: { Authorization: `Bearer ${token}` }
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

export const getPtDetail = async (id) => {
    const token = getToken();
    const res = await axios.get(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updatePt = async (id, formData) => {
    const token = getToken();
    const res = await axios.put(`${BASE_URL}/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

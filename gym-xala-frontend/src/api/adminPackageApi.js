import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/packages";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const getAllPackages = async () => {
    const res = await axios.get(BASE_URL, getHeaders());
    return res.data;
};

export const getPackageById = async (id) => {
    const res = await axios.get(`${BASE_URL}/${id}`, getHeaders());
    return res.data;
};

export const createPackage = async (formData) => {
    const res = await axios.post(BASE_URL, formData, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return res.data;
};

export const updatePackage = async (id, formData) => {
    const res = await axios.put(`${BASE_URL}/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const deletePackage = async (id) => {
    const res = await axios.delete(`${BASE_URL}/${id}`, getHeaders());
    return res.data;
};

export const togglePackageActive = async (id) => {
    const res = await axios.put(`${BASE_URL}/${id}/toggle`, {}, getHeaders());
    return res.data;
};

export const updatePackagePromotion = async (id, promotion) => {
    const res = await axios.patch(`${BASE_URL}/${id}/promotion`, { promotion }, getHeaders());
    return res.data;
};

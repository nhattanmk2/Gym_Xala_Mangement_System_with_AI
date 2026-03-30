import axiosClient from "./axiosClient";

const BASE_URL = "/admin/packages";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const getAllPackages = async () => {
    const res = await axiosClient.get(BASE_URL, getHeaders());
    return res.data;
};

export const getPackageById = async (id) => {
    const res = await axiosClient.get(`${BASE_URL}/${id}`, getHeaders());
    return res.data;
};

export const createPackage = async (formData) => {
    const res = await axiosClient.post(BASE_URL, formData, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });
    return res.data;
};

export const updatePackage = async (id, formData) => {
    const res = await axiosClient.put(`${BASE_URL}/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const deletePackage = async (id) => {
    const res = await axiosClient.delete(`${BASE_URL}/${id}`, getHeaders());
    return res.data;
};

export const togglePackageActive = async (id) => {
    const res = await axiosClient.put(`${BASE_URL}/${id}/toggle`, {}, getHeaders());
    return res.data;
};

export const updatePackagePromotion = async (id, promotion) => {
    const res = await axiosClient.patch(`${BASE_URL}/${id}/promotion`, { promotion }, getHeaders());
    return res.data;
};

export const getWorkoutPlan = async (packageId) => {
    const res = await axiosClient.get(`/admin/packages/${packageId}/workout-plan`, getHeaders());
    return res.data;
};

export const saveWorkoutPlan = async (packageId, data) => {
    const res = await axiosClient.post(`/admin/packages/${packageId}/workout-plan`, data, getHeaders());
    return res.data;
};

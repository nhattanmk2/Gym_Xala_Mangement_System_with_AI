import axiosClient from "./axiosClient";

const BASE_URL = "/pt";

const getToken = () => localStorage.getItem("token");

export const getMyProfile = async () => {    const res = await axiosClient.get(`${BASE_URL}/profile`);
    return res.data;
};

export const updateMyProfile = async (formData) => {    const res = await axiosClient.put(`${BASE_URL}/profile`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const getAllPositions = async () => {    const res = await axiosClient.get(`${BASE_URL}/positions`);
    return res.data;
};

export const getAllLocations = async () => {    const res = await axiosClient.get(`${BASE_URL}/locations`);
    return res.data;
};

export const getAllPTs = async (branchId) => {    const url = branchId ? `${BASE_URL}/all?branchId=${branchId}` : `${BASE_URL}/all`;
    const res = await axiosClient.get(url);
    return res.data;
};

export const getAvailablePtsForMember = async () => {    const res = await axiosClient.get(`${BASE_URL}/member-available`);
    return res.data;
};

export const approveBooking = async (id) => {    const res = await axiosClient.put(`${BASE_URL}/schedule/${id}/approve`);
    return res.data;
};

export const rejectBooking = async (id) => {    const res = await axiosClient.put(`${BASE_URL}/schedule/${id}/reject`);
    return res.data;
};

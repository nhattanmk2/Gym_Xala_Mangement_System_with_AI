import axiosClient from "./axiosClient";

const BASE_URL = "/admin/pts";

export const getAllPts = async (name = "", phone = "") => {
    const res = await axiosClient.get(BASE_URL, {
        params: { name, phone }});

    return res.data;
};

export const deletePt = async (id) => {    
    const res = await axiosClient.delete(`${BASE_URL}/${id}`);
    return res.data;
};

export const downgradeToMember = async (id) => {    
    const res = await axiosClient.put(`${BASE_URL}/${id}/downgrade`);
    return res.data;
};

export const createPt = async (data) => {    
    const res = await axiosClient.post(BASE_URL, data);
    return res.data;
};

export const getAllPositions = async () => {    
    const res = await axiosClient.get(`${BASE_URL}/positions`);
    return res.data;
};

export const getAllLocations = async () => {    
    const res = await axiosClient.get(`${BASE_URL}/locations`);
    return res.data;
};

export const getPtDetail = async (id) => {    
    const res = await axiosClient.get(`${BASE_URL}/${id}`);
    return res.data;
};

export const updatePt = async (id, formData) => {    
    const res = await axiosClient.put(`${BASE_URL}/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const getPtPerformance = async (id) => {
    const res = await axiosClient.get(`${BASE_URL}/${id}/performance`);
    return res.data;
};

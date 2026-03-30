import axiosClient from "./axiosClient";

const API_URL = "/member/ai-consultation";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const getAIConsultation = async (payload) => {
    const response = await axiosClient.post(API_URL, payload, { headers: getAuthHeader() });
    return response.data;
};

export const getAIConsultationHistory = async () => {
    const response = await axiosClient.get(`${API_URL}/history`, { headers: getAuthHeader() });
    return response.data;
};

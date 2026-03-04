import axios from "axios";

const API_URL = "http://localhost:8080/api/member/ai-consultation";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const getAIConsultation = async (payload) => {
    const response = await axios.post(API_URL, payload, { headers: getAuthHeader() });
    return response.data;
};

export const getAIConsultationHistory = async () => {
    const response = await axios.get(`${API_URL}/history`, { headers: getAuthHeader() });
    return response.data;
};

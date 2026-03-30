import axiosClient from "./axiosClient";

const API_BASE_URL = "/member/pt-matching";

export const getPtMatches = async (requestData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axiosClient.post(`${API_BASE_URL}/match`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }});
        return response.data;
    } catch (error) {
        throw error;
    }
};

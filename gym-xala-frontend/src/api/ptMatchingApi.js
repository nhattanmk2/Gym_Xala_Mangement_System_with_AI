import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/member/pt-matching";

export const getPtMatches = async (requestData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_BASE_URL}/match`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

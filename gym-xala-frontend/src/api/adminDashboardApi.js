import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/dashboard";

export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/stats`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};

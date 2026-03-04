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

export const getMemberGrowth = async (filter = 'month') => {
    try {
        const response = await axios.get(`${BASE_URL}/member-growth?filter=${filter}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching member growth:", error);
        throw error;
    }
};

export const getPtRanking = async (filter = 'month') => {
    try {
        const response = await axios.get(`${BASE_URL}/pt-ranking?filter=${filter}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching PT ranking:", error);
        throw error;
    }
};

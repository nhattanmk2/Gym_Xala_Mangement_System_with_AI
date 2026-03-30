import axiosClient from "./axiosClient";

const BASE_URL = "/admin/dashboard";

export const getDashboardStats = async () => {
    try {
        const response = await axiosClient.get(`${BASE_URL}/stats`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};

export const getMemberGrowth = async (filter = 'month') => {
    try {
        const response = await axiosClient.get(`${BASE_URL}/member-growth?filter=${filter}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        return response.data;
    } catch (error) {
        console.error("Error fetching member growth:", error);
        throw error;
    }
};

export const getPtRanking = async (filter = 'month') => {
    try {
        const response = await axiosClient.get(`${BASE_URL}/pt-ranking?filter=${filter}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        return response.data;
    } catch (error) {
        console.error("Error fetching PT ranking:", error);
        throw error;
    }
};

export const getPtPerformance = async (filter = 'month') => {
    try {
        const response = await axiosClient.get(`${BASE_URL}/pt-performance?filter=${filter}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        return response.data;
    } catch (error) {
        console.error("Error fetching PT performance:", error);
        throw error;
    }
};


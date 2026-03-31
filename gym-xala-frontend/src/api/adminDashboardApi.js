import axiosClient from "./axiosClient";

const BASE_URL = "/admin/dashboard";

export const getDashboardStats = async () => {
    const response = await axiosClient.get(`${BASE_URL}/stats`);
    return response.data;
};

export const getMemberGrowth = async (filter = 'month') => {
    const response = await axiosClient.get(`${BASE_URL}/member-growth`, {
        params: { filter }
    });
    return response.data;
};

export const getPtRanking = async (filter = 'month') => {
    const response = await axiosClient.get(`${BASE_URL}/pt-ranking`, {
        params: { filter }
    });
    return response.data;
};

export const getPtPerformance = async (filter = 'month') => {
    const response = await axiosClient.get(`${BASE_URL}/pt-performance`, {
        params: { filter }
    });
    return response.data;
};

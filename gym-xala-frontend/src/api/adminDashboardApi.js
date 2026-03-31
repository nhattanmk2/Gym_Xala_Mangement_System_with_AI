import axiosClient from "./axiosClient";

const BASE_URL = "/admin/dashboard";

export const getDashboardStats = async () => {
    const response = await axiosClient.get(`${BASE_URL}/stats`);
    return response.data;
};

export const getMemberGrowth = async (filter = 'month', baseDate = null) => {
    const response = await axiosClient.get(`${BASE_URL}/member-growth`, {
        params: { filter, baseDate }
    });
    return response.data;
};

export const getPtRanking = async (filter = 'month', baseDate = null) => {
    const response = await axiosClient.get(`${BASE_URL}/pt-ranking`, {
        params: { filter, baseDate }
    });
    return response.data;
};

export const getPtPerformance = async (filter = 'month', baseDate = null) => {
    const response = await axiosClient.get(`${BASE_URL}/pt-performance`, {
        params: { filter, baseDate }
    });
    return response.data;
};

export const getRevenueStats = async (filter = 'year', baseDate = null) => {
    const response = await axiosClient.get(`${BASE_URL}/revenue-stats`, {
        params: { filter, baseDate }
    });
    return response.data;
};

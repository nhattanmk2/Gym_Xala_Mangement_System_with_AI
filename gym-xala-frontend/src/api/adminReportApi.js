import axiosClient from './axiosClient';

const BASE_URL = "/admin/reports";

export const getRevenueReport = (startDate, endDate) => {    let url = `${BASE_URL}/revenue`;
    const params = {};
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }
    return axiosClient.get(url, {
        params
    });
};

export const getPtPerformanceReport = (startDate, endDate) => {    let url = `${BASE_URL}/pt-performance`;
    const params = {};
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }
    return axiosClient.get(url, {
        params
    });
};

export const getMemberSummaryReport = () => {    return axiosClient.get(`${BASE_URL}/member-summary`);
};

import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE_URL = 'http://localhost:8080/api/admin/reports';

export const getRevenueReport = (startDate, endDate) => {
    const token = getToken();
    let url = `${BASE_URL}/revenue`;
    const params = {};
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }
    return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
};

export const getPtPerformanceReport = (startDate, endDate) => {
    const token = getToken();
    let url = `${BASE_URL}/pt-performance`;
    const params = {};
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }
    return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
};

export const getMemberSummaryReport = () => {
    const token = getToken();
    return axios.get(`${BASE_URL}/member-summary`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

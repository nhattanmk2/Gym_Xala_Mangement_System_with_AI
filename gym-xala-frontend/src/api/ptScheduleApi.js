import axios from "axios";

const API_URL = "http://localhost:8080/api/pt/schedule";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const getMySchedule = async (startDate, endDate) => {
    let url = API_URL;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axios.get(url, { headers: getAuthHeader() });
    return response.data;
};

export const addScheduleSlot = async (slotData) => {
    const response = await axios.post(API_URL, slotData, { headers: getAuthHeader() });
    return response.data;
};

export const addBatchScheduleSlots = async (slots) => {
    const response = await axios.post(`${API_URL}/batch`, slots, { headers: getAuthHeader() });
    return response.data;
};

// ======================== NEW FOR PT ==========================
export const getPtClients = async () => {
    const response = await axios.get(`${API_URL}/clients`, { headers: getAuthHeader() });
    return response.data;
};

export const deleteScheduleSlot = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const getPtMemberHistory = async (memberId) => {
    const response = await axios.get(`${API_URL}/history/${memberId}`, { headers: getAuthHeader() });
    return response.data;
};

export const getPtMemberProgress = async (memberId) => {
    const response = await axios.get(`${API_URL}/progress/${memberId}`, { headers: getAuthHeader() });
    return response.data;
};

export const getMonthlyCompletedSessions = async () => {
    const response = await axios.get(`${API_URL}/stats/monthly-completed`, { headers: getAuthHeader() });
    return response.data;
};

export const getManagedClientsCount = async () => {
    const response = await axios.get(`${API_URL}/stats/clients-count`, { headers: getAuthHeader() });
    return response.data;
};

export const getUpcomingSchedules = async (limit = 5) => {
    const response = await axios.get(`${API_URL}/upcoming?limit=${limit}`, { headers: getAuthHeader() });
    return response.data;
};

export const getAvailableSlots = async (ptId) => {
    const response = await axios.get(`${API_URL}/available/${ptId}`, { headers: getAuthHeader() });
    return response.data;
};

export const bookSlot = async (slotId) => {
    const res = await axios.post(`${API_URL}/book/${slotId}`, {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

export const getMemberSchedules = async (startDate, endDate) => {
    let url = `http://localhost:8080/api/member/schedule`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await axios.get(url, { headers: getAuthHeader() });
    return res.data;
};

export const getMemberScheduleById = async (id) => {
    const res = await axios.get(`http://localhost:8080/api/member/schedule/${id}`, {
        headers: getAuthHeader()
    });
    return res.data;
};

export const cancelMemberSchedule = async (id) => {
    const res = await axios.put(`http://localhost:8080/api/member/schedule/${id}/cancel`, {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

export const saveSessionContent = async (id, payload) => {
    const res = await axios.put(`${API_URL}/${id}/content`, payload, {
        headers: getAuthHeader()
    });
    return res.data;
};

export const markSessionCompleted = async (id) => {
    const res = await axios.put(`${API_URL}/${id}/complete`, {}, {
        headers: getAuthHeader()
    });
    return res.data;
};

// API Lấy Thống kê tuần của Member
export const getMemberWeeklyStats = async () => {
    const res = await axios.get(`http://localhost:8080/api/member/stats/weekly`, {
        headers: getAuthHeader()
    });
    return res.data;
};


import axios from "axios";

const API_URL = "http://localhost:8080/api/pt/schedule";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const getMySchedule = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
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

export const deleteScheduleSlot = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
};

export const getAvailableSlots = async (ptId) => {
    const response = await axios.get(`${API_URL}/available/${ptId}`, { headers: getAuthHeader() });
    return response.data;
};

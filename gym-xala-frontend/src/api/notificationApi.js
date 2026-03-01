import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:8080/api/notifications";

const getHeaders = () => {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
};

export const getMyNotifications = async () => {
    const response = await axios.get(API_URL, { headers: getHeaders() });
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axios.get(`${API_URL}/unread-count`, { headers: getHeaders() });
    return response.data;
};

export const markAsRead = async (id) => {
    await axios.put(`${API_URL}/${id}/read`, {}, { headers: getHeaders() });
};

export const markAllAsRead = async () => {
    await axios.put(`${API_URL}/read-all`, {}, { headers: getHeaders() });
};

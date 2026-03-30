import axiosClient from "./axiosClient";

const API_URL = "/notifications";

export const getMyNotifications = async () => {
    const response = await axiosClient.get(API_URL);
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axiosClient.get(`${API_URL}/unread-count`);
    return response.data;
};

export const markAsRead = async (id) => {
    await axiosClient.put(`${API_URL}/${id}/read`, {});
};

export const markAllAsRead = async () => {
    await axiosClient.put(`${API_URL}/read-all`, {});
};

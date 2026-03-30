import axiosClient from "./axiosClient";

const API_URL = "/admin/bookings";

export const getPendingBookings = async () => {
    const response = await axiosClient.get(`${API_URL}/pending`);
    return response.data;
};

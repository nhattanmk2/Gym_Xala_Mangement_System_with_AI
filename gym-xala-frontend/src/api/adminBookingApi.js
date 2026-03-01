import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:8080/api/admin/bookings";

const getHeaders = () => {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
};

export const getPendingBookings = async () => {
    const response = await axios.get(`${API_URL}/pending`, { headers: getHeaders() });
    return response.data;
};

export const approveBooking = async (id) => {
    await axios.put(`${API_URL}/${id}/approve`, {}, { headers: getHeaders() });
};

export const rejectBooking = async (id) => {
    await axios.put(`${API_URL}/${id}/reject`, {}, { headers: getHeaders() });
};

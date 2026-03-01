import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:8080/api/admin/schedules";

export const getAllSchedules = async (filters = {}) => {
    const token = getToken();
    const { branchId, ptName, status } = filters;

    const res = await axios.get(BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            branchId: branchId || undefined,
            ptName: ptName || undefined,
            status: status || undefined,
        },
    });

    return res.data;
};
export const updateSchedule = async (id, scheduleData) => {
    const token = getToken();
    const response = await axios.put(`${BASE_URL}/${id}`, scheduleData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteSchedule = async (id) => {
    const token = getToken();
    await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const batchAddSchedule = async (ptId, slots) => {
    const token = getToken();
    const response = await axios.post(`${BASE_URL}/batch/${ptId}`, slots, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

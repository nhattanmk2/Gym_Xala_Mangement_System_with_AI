import axiosClient from "./axiosClient";

const BASE_URL = "/admin/schedules";

export const getAllSchedules = async (filters = {}) => {    const { branchId, ptName, memberName, status } = filters;

    const res = await axiosClient.get(BASE_URL, {
        params: {
            branchId: branchId || undefined,
            ptName: ptName || undefined,
            memberName: memberName || undefined,
            status: status || undefined,
        }});

    return res.data;
};

export const updateSchedule = async (id, scheduleData) => {
    const response = await axiosClient.put(`${BASE_URL}/${id}`, scheduleData);
    return response.data;
};

export const deleteSchedule = async (id) => {    await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const batchAddSchedule = async (ptId, slots) => {    const response = await axiosClient.post(`${BASE_URL}/batch/${ptId}`, slots);
    return response.data;
};

import axiosClient from "./axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getMemberProgress = async (membershipCardId) => {
    const res = await axiosClient.get(`${API_URL}/member/progress/${membershipCardId}`, getHeader());
    return res.data;
}

export const toggleExerciseStatus = async (membershipCardId, sessionExerciseId) => {
    const res = await axiosClient.post(`${API_URL}/member/progress/${membershipCardId}/toggle/${sessionExerciseId}`, {}, getHeader());
    return res.data;
};

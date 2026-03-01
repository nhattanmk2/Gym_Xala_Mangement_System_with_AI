import axios from "axios";

const BASE_URL = "http://localhost:8080/api/member/workout-roadmap";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const getMyRoadmap = async () => {
    const res = await axios.get(BASE_URL, getHeaders());
    return res.data;
};

export const toggleExercise = async (exerciseId) => {
    const res = await axios.post(`${BASE_URL}/exercises/${exerciseId}/toggle`, {}, getHeaders());
    return res.data;
};

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getMemberProgress = (membershipCardId) => axios.get(`${API_URL}/member/progress/${membershipCardId}`, getHeader());
export const toggleExerciseStatus = (membershipCardId, sessionExerciseId) =>
    axios.post(`${API_URL}/member/progress/${membershipCardId}/toggle/${sessionExerciseId}`, {}, getHeader());

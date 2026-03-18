import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getMemberProgress = async (membershipCardId) => {
    const res = await axios.get(`${API_URL}/member/progress/${membershipCardId}`, getHeader());
    return res.data;
}

export const toggleExerciseStatus = async (membershipCardId, sessionExerciseId) => {
    const res = await axios.post(`${API_URL}/member/progress/${membershipCardId}/toggle/${sessionExerciseId}`, {}, getHeader());
    return res.data;
};

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getRoadmapsByPackage = (packageId) => axios.get(`${API_URL}/admin/roadmaps/package/${packageId}`, getHeader());
export const createRoadmap = (packageId, roadmap) => axios.post(`${API_URL}/admin/roadmaps/package/${packageId}`, roadmap, getHeader());
export const deleteRoadmap = (id) => axios.delete(`${API_URL}/admin/roadmaps/${id}`, getHeader());

export const createSession = (roadmapId, session) => axios.post(`${API_URL}/admin/roadmaps/${roadmapId}/sessions`, session, getHeader());
export const deleteSession = (sessionId) => axios.delete(`${API_URL}/admin/roadmaps/sessions/${sessionId}`, getHeader());

export const addExerciseToSession = (sessionId, exercise) => axios.post(`${API_URL}/admin/roadmaps/sessions/${sessionId}/exercises`, exercise, getHeader());
export const removeExerciseFromSession = (exerciseId) => axios.delete(`${API_URL}/admin/roadmaps/exercises/${exerciseId}`, getHeader());

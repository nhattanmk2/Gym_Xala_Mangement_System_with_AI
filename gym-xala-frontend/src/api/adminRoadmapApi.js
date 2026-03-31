import axiosClient from "./axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getRoadmapsByPackage = (packageId) => axiosClient.get(`${API_URL}/admin/roadmaps/package/${packageId}`, getHeader());
export const createRoadmap = (packageId, roadmap) => axiosClient.post(`${API_URL}/admin/roadmaps/package/${packageId}`, roadmap, getHeader());
export const updateRoadmap = (id, roadmap) => axiosClient.put(`${API_URL}/admin/roadmaps/${id}`, roadmap, getHeader());
export const reorderRoadmaps = (packageId, roadmapIds) => axiosClient.post(`${API_URL}/admin/roadmaps/reorder`, { ids: roadmapIds }, getHeader());
export const deleteRoadmap = (id) => axiosClient.delete(`${API_URL}/admin/roadmaps/${id}`, getHeader());

export const createSession = (roadmapId, session) => axiosClient.post(`${API_URL}/admin/roadmaps/${roadmapId}/sessions`, session, getHeader());
export const updateSession = (sessionId, session) => axiosClient.put(`${API_URL}/admin/roadmaps/sessions/${sessionId}`, session, getHeader());
export const reorderSessions = (roadmapId, sessionIds) => axiosClient.post(`${API_URL}/admin/roadmaps/sessions/reorder`, { ids: sessionIds }, getHeader());
export const deleteSession = (sessionId) => axiosClient.delete(`${API_URL}/admin/roadmaps/sessions/${sessionId}`, getHeader());

export const addExerciseToSession = (sessionId, exercise) => axiosClient.post(`${API_URL}/admin/roadmaps/sessions/${sessionId}/exercises`, exercise, getHeader());
export const removeExerciseFromSession = (exerciseId) => axiosClient.delete(`${API_URL}/admin/roadmaps/exercises/${exerciseId}`, getHeader());

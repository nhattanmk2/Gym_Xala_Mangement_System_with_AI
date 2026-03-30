import axiosClient from "./axiosClient";

const API_URL = process.env.REACT_APP_API_URL || "";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getCategories = () => axiosClient.get(`${API_URL}/admin/exercises/categories`, getHeader());
export const createCategory = (category) => axiosClient.post(`${API_URL}/admin/exercises/categories`, category, getHeader());
export const deleteCategory = (id) => axiosClient.delete(`${API_URL}/admin/exercises/categories/${id}`, getHeader());

export const getExercisesByCategory = (categoryId) => axiosClient.get(`${API_URL}/admin/exercises/categories/${categoryId}/standards`, getHeader());
export const createExercise = (categoryId, exercise) => axiosClient.post(`${API_URL}/admin/exercises/categories/${categoryId}/standards`, exercise, getHeader());
export const deleteExercise = (id) => axiosClient.delete(`${API_URL}/admin/exercises/standards/${id}`, getHeader());

export const getLevelsByExercise = (exerciseId) => axiosClient.get(`${API_URL}/admin/exercises/standards/${exerciseId}/levels`, getHeader());
export const createLevel = (exerciseId, level) => axiosClient.post(`${API_URL}/admin/exercises/standards/${exerciseId}/levels`, level, getHeader());
export const deleteLevel = (id) => axiosClient.delete(`${API_URL}/admin/exercises/levels/${id}`, getHeader());

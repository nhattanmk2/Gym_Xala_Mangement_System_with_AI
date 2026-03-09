import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const getHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getCategories = () => axios.get(`${API_URL}/admin/exercises/categories`, getHeader());
export const createCategory = (category) => axios.post(`${API_URL}/admin/exercises/categories`, category, getHeader());
export const deleteCategory = (id) => axios.delete(`${API_URL}/admin/exercises/categories/${id}`, getHeader());

export const getExercisesByCategory = (categoryId) => axios.get(`${API_URL}/admin/exercises/categories/${categoryId}/standards`, getHeader());
export const createExercise = (categoryId, exercise) => axios.post(`${API_URL}/admin/exercises/categories/${categoryId}/standards`, exercise, getHeader());
export const deleteExercise = (id) => axios.delete(`${API_URL}/admin/exercises/standards/${id}`, getHeader());

export const getLevelsByExercise = (exerciseId) => axios.get(`${API_URL}/admin/exercises/standards/${exerciseId}/levels`, getHeader());
export const createLevel = (exerciseId, level) => axios.post(`${API_URL}/admin/exercises/standards/${exerciseId}/levels`, level, getHeader());
export const deleteLevel = (id) => axios.delete(`${API_URL}/admin/exercises/levels/${id}`, getHeader());

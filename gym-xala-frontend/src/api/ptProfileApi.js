import axiosClient from "./axiosClient";

const API_URL = "/pt/profile";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const getPTProfile = async () => {
    const response = await axiosClient.get(API_URL, { headers: getAuthHeader() });
    return response.data;
};

export const updatePTProfile = async (profileData) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(profileData));
    const response = await axiosClient.put(API_URL, formData, {
        headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
        }});
    return response.data;
};

export const updatePTAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosClient.post(`${API_URL}/avatar`, formData, {
        headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
        }});
    return response.data;
};

import axios from "axios";

const API_URL = "http://localhost:8080/api/pt/profile";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const getPTProfile = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
};

export const updatePTProfile = async (profileData) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(profileData));
    const response = await axios.put(API_URL, formData, {
        headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const updatePTAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API_URL}/avatar`, formData, {
        headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

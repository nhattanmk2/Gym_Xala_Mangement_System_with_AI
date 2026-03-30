import axiosClient from "./axiosClient";

// Using the existing endpoint that returns all GymLocations
const BASE_URL = "/locations";

export const getAllLocations = async () => {
    try {
        const res = await axiosClient.get(BASE_URL);
        return res.data;
    } catch (error) {
        console.error("Error fetching locations:", error);
        throw error;
    }
};

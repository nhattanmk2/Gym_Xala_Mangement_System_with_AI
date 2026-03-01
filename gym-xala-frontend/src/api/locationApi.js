import axios from "axios";

// Using the existing endpoint that returns all GymLocations
const BASE_URL = "http://localhost:8080/api/locations";

export const getAllLocations = async () => {
    try {
        const res = await axios.get(BASE_URL);
        return res.data;
    } catch (error) {
        console.error("Error fetching locations:", error);
        throw error;
    }
};

import axios from "axios";

const BASE_URL = "http://localhost:8080/api/packages";

export const getActivePackages = async () => {
    const res = await axios.get(BASE_URL);
    return res.data;
};

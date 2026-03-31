import axiosClient from "./axiosClient";

const BASE_URL = "/packages";

export const getActivePackages = async () => {
    const res = await axiosClient.get(BASE_URL);
    return res.data;
};

export const getPackageById = async (id) => {
    const res = await axiosClient.get(`${BASE_URL}/${id}`);
    return res.data;
};

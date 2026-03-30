import axiosClient from './axiosClient';

const API_REF = '/admin/equipment';

export const getAllEquipment = () => axiosClient.get(API_REF);
export const createEquipment = (data) => axiosClient.post(API_REF, data);
export const deleteEquipment = (id) => axiosClient.delete(`${API_REF}/${id}`);

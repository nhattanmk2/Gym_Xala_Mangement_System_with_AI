import axios from 'axios';

const API_REF = 'http://localhost:8080/api/admin/equipment';

export const getAllEquipment = () => axios.get(API_REF);
export const createEquipment = (data) => axios.post(API_REF, data);
export const deleteEquipment = (id) => axios.delete(`${API_REF}/${id}`);

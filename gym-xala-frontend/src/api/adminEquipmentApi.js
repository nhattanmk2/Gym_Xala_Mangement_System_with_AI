import axios from 'axios';
import { getToken } from '../utils/auth';

const API_REF = 'http://localhost:8080/api/admin/equipment';

const getHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const getAllEquipment = () => axios.get(API_REF, getHeader());
export const createEquipment = (data) => axios.post(API_REF, data, getHeader());
export const deleteEquipment = (id) => axios.delete(`${API_REF}/${id}`, getHeader());

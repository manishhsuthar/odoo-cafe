import axios from 'axios';

const API_URL = '/api/auth';

export const loginApi = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axios.post(`${API_URL}/logout`);
  return response.data;
};

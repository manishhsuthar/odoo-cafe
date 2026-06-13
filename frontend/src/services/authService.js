import axiosInstance from './axios';

const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login/', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await axiosInstance.post('/auth/register/', { full_name: name, email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me/');
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout/');
    return response.data;
  },
};

export default authService;

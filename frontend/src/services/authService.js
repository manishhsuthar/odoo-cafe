import axiosInstance from './axios';

const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login/', { email, password });
    return response.data;
  },

  register: async (name, email, password, role = 'cashier') => {
    const response = await axiosInstance.post('/api/auth/register/', {
      full_name: name,
      email,
      password,
      role: role.toLowerCase()
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/me/');
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout/');
    return response.data;
  },
};

export default authService;

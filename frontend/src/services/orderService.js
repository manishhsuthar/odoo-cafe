import axiosInstance from './axios';

const orderService = {
  getAll: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
};

export default orderService;

import axiosInstance from './axios';

const productService = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/products/');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/products/${id}/`);
    return response.data;
  },

  create: async (productData) => {
    const response = await axiosInstance.post('/api/products/', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await axiosInstance.put(`/api/products/${id}/`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/api/products/${id}/`);
    return response.data;
  },
};

export default productService;

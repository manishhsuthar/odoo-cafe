import axios from 'axios';
import axiosInstance from '../services/axios';

const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(camelizeKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = camelizeKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const authAPI = {
  login: (email, password) =>
    authAxios.post('/auth/login/', { email, password }).then(r => r.data),

  register: (name, email, password) =>
    authAxios.post('/auth/register/', { full_name: name, email, password }).then(r => r.data),

  getCurrentUser: () =>
    axiosInstance.get('/auth/me/').then(r => r.data),

  logout: () =>
    axiosInstance.post('/auth/logout/').then(r => r.data),
};

// Categories
export const getCategories = async () => {
  const res = await axiosInstance.get('/categories/');
  return camelizeKeys(res.data);
};

export const saveCategories = async (categories) => {
  // For bulk save, we'd need individual PUT calls; skip for now
};

export const addCategory = async (category) => {
  const res = await axiosInstance.post('/categories/', category);
  return camelizeKeys(res.data);
};

// Products
export const getProducts = async () => {
  const res = await axiosInstance.get('/products/');
  return camelizeKeys(res.data);
};

export const saveProducts = async (products) => {
  // For bulk save, we'd need individual PUT calls; skip for now
};

export const addProduct = async (product) => {
  const res = await axiosInstance.post('/products/', {
    ...product,
    category: product.category_id || undefined,
  });
  return camelizeKeys(res.data);
};

export const updateProduct = async (id, data) => {
  const res = await axiosInstance.put(`/products/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteProduct = async (id) => {
  await axiosInstance.delete(`/products/${id}/`);
};

// Orders
export const getOrders = async () => {
  const res = await axiosInstance.get('/orders/');
  return camelizeKeys(res.data);
};

export const saveOrders = async (orders) => {
  // For bulk save, skip
};

export const addOrder = async (order) => {
  const res = await axiosInstance.post('/orders/', order);
  return camelizeKeys(res.data);
};

export const updateOrderStatus = async (id, status, paymentMethod) => {
  const res = await axiosInstance.patch(`/orders/${id}/status/`, {
    status,
    payment_method: paymentMethod,
  });
  return camelizeKeys(res.data);
};

export const deleteOrder = async (id) => {
  await axiosInstance.delete(`/orders/${id}/`);
};

// Customers
export const getCustomers = async () => {
  const res = await axiosInstance.get('/customers/');
  return camelizeKeys(res.data);
};

export const addCustomer = async (data) => {
  const res = await axiosInstance.post('/customers/', data);
  return camelizeKeys(res.data);
};

export const updateCustomer = async (id, data) => {
  const res = await axiosInstance.put(`/customers/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteCustomer = async (id) => {
  await axiosInstance.delete(`/customers/${id}/`);
};

// Tables
export const getTables = async () => {
  const res = await axiosInstance.get('/tables/');
  return camelizeKeys(res.data);
};

export const updateTable = async (id, data) => {
  const res = await axiosInstance.put(`/tables/${id}/`, data);
  return camelizeKeys(res.data);
};

// Coupons
export const getCoupons = async () => {
  const res = await axiosInstance.get('/coupons/');
  return camelizeKeys(res.data);
};

export const addCoupon = async (data) => {
  const res = await axiosInstance.post('/coupons/', data);
  return camelizeKeys(res.data);
};

export const updateCoupon = async (id, data) => {
  const res = await axiosInstance.put(`/coupons/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteCoupon = async (id) => {
  await axiosInstance.delete(`/coupons/${id}/`);
};

// Payment Methods
export const getPaymentMethods = async () => {
  const res = await axiosInstance.get('/payment-methods/');
  return camelizeKeys(res.data);
};

export const savePaymentMethods = async (methods) => {
  const res = await axiosInstance.put('/payment-methods/', methods);
  return camelizeKeys(res.data);
};

// Employees
export const getEmployees = () => {
  try {
    return JSON.parse(localStorage.getItem('employees') || '[]');
  } catch { return []; }
};

export const saveEmployees = (employees) => {
  localStorage.setItem('employees', JSON.stringify(employees));
};

export const getEmployeeLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('employee_logs') || '[]');
  } catch { return []; }
};

export const saveEmployeeLogs = (logs) => {
  localStorage.setItem('employee_logs', JSON.stringify(logs));
};

// POS Session Logs
export const getPOSSessionLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('pos_session_logs') || '[]');
  } catch { return []; }
};

export const savePOSSessionLogs = (logs) => {
  localStorage.setItem('pos_session_logs', JSON.stringify(logs));
};

// Kitchen Inventory
export const getKitchenInventory = () => {
  try {
    return JSON.parse(localStorage.getItem('kitchen_inventory') || '[]');
  } catch { return []; }
};

export const saveKitchenInventory = (items) => {
  localStorage.setItem('kitchen_inventory', JSON.stringify(items));
};

// Floor Plan Tables
export const getFloorPlanTables = () => {
  try {
    return JSON.parse(localStorage.getItem('floor_plan_tables') || '[]');
  } catch { return []; }
};

export const saveFloorPlanTables = (tables) => {
  localStorage.setItem('floor_plan_tables', JSON.stringify(tables));
};

// Init
export const initDb = () => {
  // Seed localStorage defaults if needed
};

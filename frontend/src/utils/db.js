// LocalStorage database helpers for Categories and Products
import axiosInstance from '../services/axios';

const camelize = (str) =>
  str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelize(key)]: camelizeKeys(obj[key]),
      }),
      {}
    );
  }
  return obj;
};

export const getCategories = async () => {
  const res = await axiosInstance.get('/api/categories/');
  return camelizeKeys(res.data);
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/api/categories/${id}/`);
};

export const addCategory = async (category) => {
  const res = await axiosInstance.post('/api/categories/', category);
  return camelizeKeys(res.data);
};

// Products
export const getProducts = async () => {
  const res = await axiosInstance.get('/api/products/');
  return camelizeKeys(res.data);
};

export const addProduct = async (product) => {
  const res = await axiosInstance.post('/api/products/', {
    ...product,
    category: product.category || product.categoryId || product.category_id,
  });
  return camelizeKeys(res.data);
};

export const updateProduct = async (id, data) => {
  const res = await axiosInstance.put(`/api/products/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteProduct = async (id) => {
  await axiosInstance.delete(`/api/products/${id}/`);
};

// Orders
export const getOrders = async () => {
  const res = await axiosInstance.get('/api/orders/');
  return camelizeKeys(res.data);
};

export const addOrder = async (order) => {
  const res = await axiosInstance.post('/api/orders/', order);
  return camelizeKeys(res.data);
};

export const updateOrder = async (id, order) => {
  const res = await axiosInstance.patch(`/api/orders/${id}/`, order);
  return camelizeKeys(res.data);
};

export const updateOrderStatus = async (id, status, paymentMethod) => {
  const res = await axiosInstance.patch(`/api/orders/${id}/status/`, {
    status,
    payment_method: paymentMethod,
  });
  return camelizeKeys(res.data);
};

export const deleteOrder = async (id) => {
  await axiosInstance.delete(`/api/orders/${id}/`);
};

// Customers
export const getCustomers = async () => {
  const res = await axiosInstance.get('/api/customers/');
  return camelizeKeys(res.data);
};

export const addCustomer = async (data) => {
  const res = await axiosInstance.post('/api/customers/', data);
  return camelizeKeys(res.data);
};

export const updateCustomer = async (id, data) => {
  const res = await axiosInstance.put(`/api/customers/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteCustomer = async (id) => {
  await axiosInstance.delete(`/api/customers/${id}/`);
};

// Tables
export const getTables = async () => {
  const res = await axiosInstance.get('/api/tables/');
  return camelizeKeys(res.data);
};

export const updateTable = async (id, data) => {
  const res = await axiosInstance.patch(`/api/tables/${id}/`, data);
  return camelizeKeys(res.data);
};

export const addTable = async (table) => {
  const res = await axiosInstance.post('/api/tables/', {
    floor: table.floor,
    name: table.name,
    capacity: table.capacity || 4,
    status: table.status || 'free',
    customer_name: table.customerName || table.customer_name || ''
  });
  return camelizeKeys(res.data);
};

export const deleteTable = async (id) => {
  await axiosInstance.delete(`/api/tables/${id}/`);
};

// Coupons
export const getCoupons = async () => {
  const res = await axiosInstance.get('/api/coupons/');
  return camelizeKeys(res.data);
};

export const addCoupon = async (data) => {
  const res = await axiosInstance.post('/api/coupons/', data);
  return camelizeKeys(res.data);
};

export const updateCoupon = async (id, data) => {
  const res = await axiosInstance.patch(`/api/coupons/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteCoupon = async (id) => {
  await axiosInstance.delete(`/api/coupons/${id}/`);
};

// Payment Methods
export const getPaymentMethods = async () => {
  try {
    return JSON.parse(localStorage.getItem('payment_methods') || '[]');
  } catch { return []; }
};

export const savePaymentMethods = async (methods) => {
  localStorage.setItem('payment_methods', JSON.stringify(methods));
  return methods;
};

// Employees
export const getEmployees = async () => {
  const res = await axiosInstance.get('/api/auth/users/');
  return camelizeKeys(res.data);
};

export const addEmployee = async (employee) => {
  let role = employee.role ? employee.role.toLowerCase() : 'cashier';
  if (role === 'chef') {
    role = 'kitchen';
  } else if (role === 'manager') {
    role = 'admin';
  }
  const res = await axiosInstance.post('/api/auth/register/', {
    email: employee.email,
    full_name: employee.fullName || employee.name,
    role: role,
    password: employee.password
  });
  return camelizeKeys(res.data);
};

export const deleteEmployee = async (id) => {
  await axiosInstance.delete(`/api/auth/users/${id}/`);
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

// Reservations
export const getReservations = async () => {
  const res = await axiosInstance.get('/api/reservations/');
  return camelizeKeys(res.data);
};

export const addReservation = async (reservation) => {
  const res = await axiosInstance.post('/api/reservations/', reservation);
  return camelizeKeys(res.data);
};

export const updateReservation = async (id, data) => {
  const res = await axiosInstance.put(`/api/reservations/${id}/`, data);
  return camelizeKeys(res.data);
};

export const deleteReservation = async (id) => {
  await axiosInstance.delete(`/api/reservations/${id}/`);
};

export const checkInReservation = async (id) => {
  const res = await axiosInstance.post(`/api/reservations/${id}/check-in/`);
  return camelizeKeys(res.data);
};

export const cancelReservation = async (id) => {
  const res = await axiosInstance.post(`/api/reservations/${id}/cancel/`);
  return camelizeKeys(res.data);
};

export const getUpcomingReservations = async () => {
  const res = await axiosInstance.get('/api/reservations/upcoming/');
  return camelizeKeys(res.data);
};

export const createReservation = async (reservation) => {
  const res = await axiosInstance.post('/api/reservations/', reservation);
  return camelizeKeys(res.data);
};

// Reports
export const getReportsSummary = async (params) => {
  const res = await axiosInstance.get('/api/reports/summary/', { params });
  return camelizeKeys(res.data);
};

export const getSalesTrend = async (params) => {
  const res = await axiosInstance.get('/api/reports/sales-trend/', { params });
  return camelizeKeys(res.data);
};

export const getTopOrders = async (params) => {
  const res = await axiosInstance.get('/api/reports/top-orders/', { params });
  return camelizeKeys(res.data);
};

export const getTopProducts = async (params) => {
  const res = await axiosInstance.get('/api/reports/top-products/', { params });
  return camelizeKeys(res.data);
};

export const getTopCategories = async (params) => {
  const res = await axiosInstance.get('/api/reports/top-categories/', { params });
  return camelizeKeys(res.data);
};
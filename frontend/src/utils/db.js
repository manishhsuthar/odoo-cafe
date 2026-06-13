// LocalStorage database helpers for Categories and Products

const DEFAULT_CATEGORIES = [
  { id: 'cat_drink', name: 'Drink', color: '#0d9488' },
  { id: 'cat_food', name: 'Food', color: '#ea580c' },
  { id: 'cat_bev', name: 'Beverages', color: '#7c3aed' },
  { id: 'cat_chaat', name: 'Chaat', color: '#b45309' },
  { id: 'cat_des', name: 'Desert', color: '#db2777' },
  { id: 'cat_meal', name: 'Meal', color: '#2563eb' }
];

const DEFAULT_PRODUCTS = [
  { id: 'b1', name: 'Masala Tea', price: 40, inStock: true, category: 'Beverages', tax: 5, description: 'Hot brewed Indian spiced tea' },
  { id: 'b2', name: 'Coffee', price: 60, inStock: true, category: 'Beverages', tax: 5, description: 'Rich roasted espresso coffee' },
  { id: 'b3', name: 'Lassi', price: 50, inStock: true, category: 'Beverages', tax: 5, description: 'Creamy sweet yogurt drink' },
  { id: 'b4', name: 'Espresso', price: 70, inStock: true, category: 'Beverages', tax: 5, description: 'Single shot espresso' },
  { id: 'b5', name: 'Cold Brew', price: 90, inStock: false, category: 'Beverages', tax: 5, description: 'Slow-steeped iced coffee' },
  { id: 'c1', name: 'Samosa Chaat', price: 120, inStock: true, category: 'Chaat', tax: 5, description: 'Crushed samosa topped with yogurt and chutneys' },
  { id: 'c2', name: 'Papdi Chaat', price: 110, inStock: true, category: 'Chaat', tax: 5, description: 'Crisp fried dough wafers with potatoes and chutneys' },
  { id: 'c3', name: 'Bhel Puri', price: 90, inStock: true, category: 'Chaat', tax: 5, description: 'Savory puffed rice snack with tangy sauces' },
  { id: 'd1', name: 'Chocolate Brownie', price: 180, inStock: true, category: 'Desert', tax: 18, description: 'Warm fudge chocolate brownie' },
  { id: 'd2', name: 'Ice Cream Cup', price: 100, inStock: true, category: 'Desert', tax: 18, description: 'Vanilla ice cream scoop' },
  { id: 'd3', name: 'Gulab Jamun', price: 80, inStock: false, category: 'Desert', tax: 18, description: 'Sweet milk solid balls in syrup' },
  { id: 'm1', name: 'Cheese Burger', price: 150, inStock: true, category: 'Meal', tax: 18, description: 'Loaded double cheese grilled burger' },
  { id: 'm2', name: 'Veg Sandwich', price: 120, inStock: true, category: 'Meal', tax: 5, description: 'Toasted loaded vegetable sandwich' },
  { id: 'm3', name: 'Paneer Wrap', price: 160, inStock: true, category: 'Meal', tax: 18, description: 'Grilled flatbread wrap with spiced paneer' },
];

const DEFAULT_ORDERS = [
  { id: 'OR-8239', dateTime: '2026-06-13T13:45:00Z', table: 'Table 4', amount: 1450, status: 'Paid', paymentMethod: 'UPI', items: '2 x Cheese Burger, 1 x Chocolate Brownie, 2 x Cold Brew' },
  { id: 'OR-1082', dateTime: '2026-06-13T13:30:00Z', table: 'Table 12', amount: 300, status: 'Unpaid', paymentMethod: '-', items: '2 x Veg Sandwich' },
  { id: 'OR-9382', dateTime: '2026-06-13T13:15:00Z', table: 'Table 7', amount: 480, status: 'Paid', paymentMethod: 'Cash', items: '3 x Paneer Wrap, 1 x Lassi' },
  { id: 'OR-4821', dateTime: '2026-06-13T12:50:00Z', table: 'Table 2', amount: 160, status: 'Paid', paymentMethod: 'Card', items: '1 x Paneer Wrap' },
  { id: 'OR-3921', dateTime: '2026-06-13T12:30:00Z', table: 'Table 9', amount: 120, status: 'Unpaid', paymentMethod: '-', items: '1 x Veg Sandwich' }
];

export const initDb = () => {
  if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(DEFAULT_ORDERS));
  }
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/categories/${id}/`);
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

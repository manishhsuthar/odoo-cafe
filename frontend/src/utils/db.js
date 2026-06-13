// LocalStorage database helpers for Categories and Products

const DEFAULT_CATEGORIES = [
  { id: 'cat_drink', name: 'Drinks', color: '#0d9488' },
  { id: 'cat_food', name: 'Foods', color: '#ea580c' },
  { id: 'cat_bev', name: 'Beverages', color: '#7c3aed' },
  { id: 'cat_chaat', name: 'Chaat', color: '#b45309' },
  { id: 'cat_des', name: 'Desert', color: '#db2777' },
  { id: 'cat_meal', name: 'Meal', color: '#2563eb' }
];

const DEFAULT_PRODUCTS = [
  { id: 'dr1', name: 'Mango Shake', price: 120, inStock: true, category: 'Drinks', tax: 5, description: 'Fresh sweet mango milkshake' },
  { id: 'dr2', name: 'Lemon Mint Mojito', price: 130, inStock: true, category: 'Drinks', tax: 5, description: 'Refreshing sparkling mojito with fresh mint and lemon' },
  { id: 'dr3', name: 'Fresh Orange Juice', price: 110, inStock: true, category: 'Drinks', tax: 5, description: '100% freshly squeezed oranges' },
  { id: 'dr4', name: 'Iced Latte', price: 140, inStock: true, category: 'Drinks', tax: 5, description: 'Espresso chilled with milk over ice' },
  { id: 'dr5', name: 'Hot Cocoa', price: 90, inStock: true, category: 'Drinks', tax: 5, description: 'Rich hot milk cocoa' },
  
  { id: 'fd1', name: 'Margherita Pizza', price: 250, inStock: true, category: 'Foods', tax: 5, description: 'Classic mozzarella cheese and fresh basil pizza' },
  { id: 'fd2', name: 'Veg Club Sandwich', price: 150, inStock: true, category: 'Foods', tax: 5, description: 'Triple decker toast with fresh veggies and cheese' },
  { id: 'fd3', name: 'Garlic Bread Sticks', price: 120, inStock: true, category: 'Foods', tax: 5, description: 'Baked garlic butter dough sticks' },
  { id: 'fd4', name: 'French Fries', price: 90, inStock: true, category: 'Foods', tax: 5, description: 'Crispy salted potato fries' },
  { id: 'fd5', name: 'Spiced Paneer Tikka', price: 210, inStock: true, category: 'Foods', tax: 5, description: 'Spicy grilled cottage cheese cubes' },

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
  const cats = localStorage.getItem('categories');
  const hasDrinksCategory = cats && cats.includes('Drinks');

  if (!cats || !hasDrinksCategory) {
    localStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(DEFAULT_ORDERS));
  }
};

export const getCategories = () => {
  initDb();
  return JSON.parse(localStorage.getItem('categories'));
};

export const saveCategories = (categories) => {
  localStorage.setItem('categories', JSON.stringify(categories));
};

export const getProducts = () => {
  initDb();
  return JSON.parse(localStorage.getItem('products'));
};

export const saveProducts = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: `prod_${Date.now()}`,
    inStock: true
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const addCategory = (category) => {
  const categories = getCategories();
  const newCategory = {
    ...category,
    id: `cat_${Date.now()}`
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
};

export const getOrders = () => {
  initDb();
  return JSON.parse(localStorage.getItem('orders'));
};

export const saveOrders = (orders) => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

export const addOrder = (order) => {
  const orders = getOrders();
  const newOrder = {
    id: `OR-${Math.floor(1000 + Math.random() * 9000)}`,
    dateTime: new Date().toISOString(),
    ...order
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
};

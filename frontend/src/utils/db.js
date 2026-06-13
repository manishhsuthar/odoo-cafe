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

export const initDb = () => {
  if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
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

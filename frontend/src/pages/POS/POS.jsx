import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Monitor,
  Layers,
  PlusCircle,
  Grid,
  User,
  Menu,
  Send,
  ChevronRight,
  Trash2,
  IndianRupee,
  UserPlus,
  Percent,
  ChefHat,
  BarChart2,
  CreditCard,
  Calendar,
  LogOut,
  Tag
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { getCategories, getProducts, addOrder, addProduct, getOrders, updateProduct, deleteProduct } from '../../utils/db';
import POSOrdersHistory from './components/POSOrdersHistory';
import POSProductsManagement from './components/POSProductsManagement';
import POSCategoriesManagement from './components/POSCategoriesManagement';
import POSPaymentMethodsManagement from './components/POSPaymentMethodsManagement';
import POSCouponsManagement from './components/POSCouponsManagement';
import POSBookingsManagement from './components/POSBookingsManagement';
import POSEmployeesManagement from './components/POSEmployeesManagement';
import POSReports from './components/POSReports';

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Espresso',
    price: 90,
    tax: 5,
    category: 'Coffee',
    description: 'Strong and bold espresso shot',
    inStock: true
  },
  {
    id: 2,
    name: 'Cappuccino',
    price: 120,
    tax: 5,
    category: 'Coffee',
    description: 'Espresso with steamed milk and thick foam',
    inStock: true
  },
  {
    id: 3,
    name: 'Cafe Latte',
    price: 130,
    tax: 5,
    category: 'Coffee',
    description: 'Espresso with steamed milk and a light layer of foam',
    inStock: true
  },
  {
    id: 4,
    name: 'Masala Tea',
    price: 60,
    tax: 5,
    category: 'Tea',
    description: 'Traditional spiced Indian tea',
    inStock: true
  },
  {
    id: 5,
    name: 'Green Tea',
    price: 70,
    tax: 5,
    category: 'Tea',
    description: 'Healthy organic green tea',
    inStock: true
  },
  {
    id: 6,
    name: 'Paneer Tikka Sandwich',
    price: 150,
    tax: 5,
    category: 'Snacks',
    description: 'Spicy paneer tikka stuffed in grilled bread',
    inStock: true
  },
  {
    id: 7,
    name: 'French Fries',
    price: 100,
    tax: 5,
    category: 'Snacks',
    description: 'Crispy golden potato fries',
    inStock: true
  },
  {
    id: 8,
    name: 'Chocolate Brownie',
    price: 110,
    tax: 18,
    category: 'Desserts',
    description: 'Fudgy chocolate brownie served warm',
    inStock: true
  }
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Coffee', color: '#ea580c' },
  { id: 2, name: 'Tea', color: '#0d9488' },
  { id: 3, name: 'Snacks', color: '#7c3aed' },
  { id: 4, name: 'Desserts', color: '#d97706' }
];

const POS = ({ view = 'pos' }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Load from localStorage
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('');

  // Session Logs states
  const [logs, setLogs] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState('checkout');

  // POS Orders History states
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [searchOrdersQuery, setSearchOrdersQuery] = useState('');

  useEffect(() => {
    const loadOrders = () => {
      const stored = localStorage.getItem('orders');
      if (stored) {
        try {
          setOrdersList(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);

  // POS Products states and handlers
  const [searchCatalogQuery, setSearchCatalogQuery] = useState('');

  // POS Categories states
  const [newCategoryColor, setNewCategoryColor] = useState('#ea580c');
  const [searchCategoriesQuery, setSearchCategoriesQuery] = useState('');

  // POS Payment Methods states
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);

  // POS Coupons & Promos states
  const [allCouponsList, setAllCouponsList] = useState([]);

  // POS Bookings & Tables states
  const [bookingsList, setBookingsList] = useState([]);

  // POS Employees states
  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [attendanceLogsList, setAttendanceLogsList] = useState([]);

  // Combined management loader
  const reloadManagementData = () => {
    // Payment methods
    const pmStored = localStorage.getItem('payment_methods');
    if (pmStored) {
      setAllPaymentMethods(JSON.parse(pmStored));
    } else {
      const defaultPM = [
        { id: '1', name: 'Cash', type: 'Cash', value: '', activated: true },
        { id: '2', name: 'Card', type: 'Card', value: '', activated: true },
        { id: '3', name: 'UPI', type: 'UPI', value: 'abc@upi.com', activated: true }
      ];
      localStorage.setItem('payment_methods', JSON.stringify(defaultPM));
      setAllPaymentMethods(defaultPM);
    }
    // Coupons list
    const cpStored = localStorage.getItem('coupons_list');
    if (cpStored) {
      setAllCouponsList(JSON.parse(cpStored));
    } else {
      const defaultCoupons = [
        { id: 'c_1', name: 'Regular Discount', code: 'NEW20', value: 20, discountType: 'Percentage', minAmount: 100, activated: true },
        { id: 'c_2', name: 'Festive Offer', code: 'FEST50', value: 50, discountType: 'Fixed', minAmount: 500, activated: true }
      ];
      localStorage.setItem('coupons_list', JSON.stringify(defaultCoupons));
      setAllCouponsList(defaultCoupons);
    }
    // Bookings
    const bkStored = localStorage.getItem('pos_bookings');
    if (bkStored) {
      setBookingsList(JSON.parse(bkStored));
    } else {
      const defaultBookings = [
        { id: 'b_1', customerName: 'Manish Suthar', phone: '9876543210', dateTime: '2026-06-13T19:00', guests: 4, table: 'Table 4', status: 'Confirmed' },
        { id: 'b_2', customerName: 'Aditya Raj', phone: '9988776655', dateTime: '2026-06-14T20:30', guests: 2, table: 'Table 12', status: 'Pending' }
      ];
      localStorage.setItem('pos_bookings', JSON.stringify(defaultBookings));
      setBookingsList(defaultBookings);
    }
    // Employees
    const empStored = localStorage.getItem('employees');
    if (empStored) {
      setAllEmployeesList(JSON.parse(empStored));
    } else {
      const defaultEmployees = [
        { id: 'emp_1', name: 'Ramesh Chef', email: 'ramesh@cafe.com', role: 'Chef' },
        { id: 'emp_2', name: 'Suresh Manager', email: 'suresh@cafe.com', role: 'Manager' }
      ];
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
      setAllEmployeesList(defaultEmployees);
    }
    // Shift Attendance Logs
    const shStored = localStorage.getItem('employee_logs');
    if (shStored) {
      setAttendanceLogsList(JSON.parse(shStored));
    }
  };

  useEffect(() => {
    reloadManagementData();
  }, []);

  const handleToggleStock = async (prodId) => {
    const prod = productsList.find(p => p.id === prodId);
    if (!prod) return;
    const newStock = !prod.inStock;
    try {
      await updateProduct(prodId, {
        ...prod,
        in_stock: newStock,
      });
      const updated = productsList.map(p => {
        if (p.id === prodId) {
          addLogEntry(`Product "${p.name}" marked as ${newStock ? 'In Stock' : 'Out of Stock'}`, 'info');
          return { ...p, inStock: newStock };
        }
        return p;
      });
      setProductsList(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to toggle stock status');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const prod = productsList.find(p => p.id === prodId);
      try {
        await deleteProduct(prodId);
        const updated = productsList.filter(p => p.id !== prodId);
        setProductsList(updated);
        if (prod) {
          addLogEntry(`Deleted product "${prod.name}"`, 'danger');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };

  // Categories Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor
    };
    const current = JSON.parse(localStorage.getItem('categories') || '[]');
    current.push(newCat);
    localStorage.setItem('categories', JSON.stringify(current));
    setNewCategoryName('');

    // Update lists
    setCategoriesList(current.map(c => c.name));
    addLogEntry(`Added new category: ${newCat.name}`, 'success');
    alert('Category added successfully!');
  };

  const handleDeleteCategory = async (cat) => {
    const catName = getSafeCategoryString(cat);
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const current = JSON.parse(localStorage.getItem('categories') || '[]');
      const updated = current.filter(c => c.name !== catName);
      localStorage.setItem('categories', JSON.stringify(updated));
      setCategoriesList(updated.map(c => c.name));
      addLogEntry(`Deleted category: ${catName}`, 'danger');
    }
  };



  const addLogEntry = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = { id: `log_${Date.now()}_${Math.random()}`, time, message, type };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100);
      localStorage.setItem('pos_session_logs', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cats = await getCategories();
        const prods = await getProducts();

        const finalCats = cats && cats.length > 0 ? cats : MOCK_CATEGORIES;
        const finalProds = prods && prods.length > 0 ? prods : MOCK_PRODUCTS;

        setCategoriesList(finalCats.map(c => c.name));
        setProductsList(finalProds);
        if (finalCats.length > 0) {
          setSelectedCategory(finalCats[0].name);
        }
      } catch (err) {
        console.error("Error loading POS initial data, using mock data:", err);
        setCategoriesList(MOCK_CATEGORIES.map(c => c.name));
        setProductsList(MOCK_PRODUCTS);
        setSelectedCategory(MOCK_CATEGORIES[0].name);
      }
    };
    loadInitialData();

    // Load dynamic active payment methods
    const stored = localStorage.getItem('payment_methods');
    let list = [];
    if (stored) {
      list = JSON.parse(stored);
    } else {
      list = [
        { id: '1', name: 'Cash', type: 'Cash', value: '', activated: true },
        { id: '2', name: 'Card', type: 'Card', value: '', activated: true },
        { id: '3', name: 'UPI', type: 'UPI', value: 'abc@upi.com', activated: true }
      ];
      localStorage.setItem('payment_methods', JSON.stringify(list));
    }
    const active = list.filter(m => m.activated).map(m => ({
      ...m,
      name: m.name || m.type
    }));
    setPaymentMethods(active);
    if (active.length > 0) {
      setSelectedPayment(active[0].name);
    }

    // Load session logs
    const storedLogs = localStorage.getItem('pos_session_logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      const initialLogs = [
        { id: 'l1', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'System initialization check: Passed', type: 'success' },
        { id: 'l2', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: `POS Session started by: ${user ? user.name : 'Staff'}`, type: 'info' }
      ];
      setLogs(initialLogs);
      localStorage.setItem('pos_session_logs', JSON.stringify(initialLogs));
    }
  }, []);

  // Watch for active user logging in
  useEffect(() => {
    if (user) {
      addLogEntry(`User logged in: ${user.name} (${user.role.toUpperCase()})`, 'success');
    }
  }, [user]);

  // Keep a live sync hook to pull logs periodically (e.g. from table reservation changes)
  useEffect(() => {
    const handleSync = () => {
      const storedLogs = localStorage.getItem('pos_session_logs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    };
    const interval = setInterval(handleSync, 2000);
    return () => clearInterval(interval);
  }, []);

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [paidAmount, setPaidAmount] = useState('0');
  const [activeTable, setActiveTable] = useState('');
  const [tableCarts, setTableCarts] = useState({});
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleTableSelect = (tableName) => {
    if (activeTable) {
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: { cart, appliedCoupon, discountAmount, paidAmount }
      }));
    }
    
    setActiveTable(tableName);
    setIsTableModalOpen(false);
    
    setTableCarts(prev => {
      const existingData = prev[tableName] || { cart: [], appliedCoupon: null, discountAmount: 0, paidAmount: '0' };
      setCart(existingData.cart);
      setAppliedCoupon(existingData.appliedCoupon);
      setDiscountAmount(existingData.discountAmount);
      setPaidAmount(existingData.paidAmount);
      return prev;
    });
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Table Floor Plan modal
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeFloor, setActiveFloor] = useState(1);
  const [tablesList, setTablesList] = useState(() => {
    const storedTables = localStorage.getItem('floor_plan_tables');
    if (storedTables) {
      return JSON.parse(storedTables);
    }
    const defaults = [];
    for (let i = 1; i <= 10; i++) {
      defaults.push({ id: `f${i}`, name: `f${i}`, floor: 1, status: 'free' });
      defaults.push({ id: `s${i}`, name: `s${i}`, floor: 2, status: 'free' });
    }
    localStorage.setItem('floor_plan_tables', JSON.stringify(defaults));
    return defaults;
  });
  const [activeBookingsTab, setActiveBookingsTab] = useState('reservations'); // 'reservations' or 'tables'
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [adminActiveFloor, setAdminActiveFloor] = useState(1);
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState('');
  const [editingTableFloor, setEditingTableFloor] = useState(1);

  // Add product modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Cart operations
  const addToCart = (product) => {
    if (!product.inStock) {
      alert(`${product.name} is currently out of stock.`);
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    addLogEntry(`Added item to active order: ${product.name} (₹${product.price})`, 'info');
  };

  const updateQuantity = (id, delta) => {
    const item = cart.find(x => x.id === id);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty > 0) {
        addLogEntry(`Updated quantity of ${item.name} to ${newQty}`, 'info');
      } else {
        addLogEntry(`Removed ${item.name} from active order`, 'warning');
      }
    }
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Calculations and Coupon System
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Recalculate discount whenever cart, subTotal, or appliedCoupon changes
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountAmount(0);
      return;
    }

    // Min subtotal total check
    if (subTotal < appliedCoupon.minAmount) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      return;
    }

    let discountableSum = 0;
    if (appliedCoupon.targetType === 'All' || !appliedCoupon.targetType) {
      discountableSum = subTotal;
    } else if (appliedCoupon.targetType === 'Category') {
      const cat = appliedCoupon.targetValue.toLowerCase();
      discountableSum = cart.reduce((acc, item) => {
        if (item.category && item.category.toLowerCase() === cat) {
          return acc + (item.price * item.quantity);
        }
        return acc;
      }, 0);
    } else if (appliedCoupon.targetType === 'Product') {
      const prodName = appliedCoupon.targetValue.toLowerCase();
      discountableSum = cart.reduce((acc, item) => {
        if (item.name && item.name.toLowerCase() === prodName) {
          return acc + (item.price * item.quantity);
        }
        return acc;
      }, 0);
    }

    let calculatedDisc = 0;
    if (appliedCoupon.discountType === 'Percentage') {
      calculatedDisc = Math.round(discountableSum * (appliedCoupon.value / 100));
    } else {
      calculatedDisc = Math.min(appliedCoupon.value, discountableSum);
    }
    setDiscountAmount(calculatedDisc);
  }, [cart, appliedCoupon, subTotal]);

  // Automatic Promo engine
  useEffect(() => {
    // If a coupon code is manually applied, that has precedence
    if (appliedCoupon && appliedCoupon.type === 'Coupon') {
      return;
    }

    const stored = localStorage.getItem('coupons_list');
    if (!stored) return;

    try {
      const list = JSON.parse(stored);
      // Find active Automated Promos where subtotal fits
      const autoPromos = list.filter(c => c.type === 'Automated Promo' && c.activated && subTotal >= c.minAmount);
      if (autoPromos.length > 0) {
        // Find the one with maximum benefit
        const bestPromo = autoPromos.sort((a, b) => b.value - a.value)[0];
        setAppliedCoupon(bestPromo);
      } else {
        // Clear if conditions no longer match
        if (appliedCoupon && appliedCoupon.type === 'Automated Promo') {
          setAppliedCoupon(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [subTotal, cart]);

  const totalBeforeTax = Math.max(0, subTotal - discountAmount);
  const tax = Math.round(totalBeforeTax * 0.05); // 5% GST
  const total = totalBeforeTax + tax;

  useEffect(() => {
    setPaidAmount(total.toString());
  }, [total]);

  const handleApplyCouponCode = (codeStr) => {
    if (!codeStr.trim()) {
      alert('Please enter a coupon code.');
      return;
    }
    const stored = localStorage.getItem('coupons_list');
    let couponsList = [];
    if (stored) {
      couponsList = JSON.parse(stored);
    } else {
      couponsList = [
        { id: '1', name: 'Summur Sale', type: 'Coupon', code: 'SUMMER20', discountType: 'Percentage', value: 20, minAmount: 100, targetType: 'All', targetValue: '', activated: true },
        { id: '2', name: 'Promotions', type: 'Automated Promo', code: 'AUTO10', discountType: 'Percentage', value: 10, minAmount: 150, targetType: 'All', targetValue: '', activated: true },
        { id: '3', name: 'New user', type: 'Coupon', code: 'NEW20', discountType: 'Fixed Amount', value: 50, minAmount: 200, targetType: 'All', targetValue: '', activated: true }
      ];
      localStorage.setItem('coupons_list', JSON.stringify(couponsList));
    }

    const found = couponsList.find(c => c.code && c.code.toUpperCase() === codeStr.trim().toUpperCase() && c.activated);
    if (!found) {
      alert('Coupon code invalid or expired.');
      return;
    }

    if (subTotal < found.minAmount) {
      alert(`Coupon code "${found.code}" requires a minimum subtotal of ₹${found.minAmount}. Current subtotal is ₹${subTotal}.`);
      return;
    }

    setAppliedCoupon(found);
    addLogEntry(`Applied coupon code: ${found.code} (Discount: ${found.value}${found.discountType === 'Percentage' ? '%' : ' Fixed'})`, 'success');
    setIsDiscountModalOpen(false);
    setCouponInput('');
  };

  const handleClearCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    addLogEntry(`Cleared coupon code`, 'warning');
  };

  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdCategory) {
      alert('Please fill out Name, Price and Category.');
      return;
    }
    const newProd = {
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCategory,
      description: newProdDesc || 'Custom POS Product',
      tax: 5
    };
    try {
      const saved = await addProduct(newProd);
      addLogEntry(`Created and added new product: ${saved.name} to ${saved.category}`, 'success');

      // Refresh product lists
      const prods = await getProducts();
      setProductsList(prods);

      // Refresh categories in case it is new
      const cats = await getCategories();
      setCategoriesList(cats.map(c => c.name));

      // Clear form & close modal
      setNewProdName('');
      setNewProdPrice('');
      setNewProdCategory('');
      setNewProdDesc('');
      setIsAddProductModalOpen(false);
      alert('Product added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  // Numpad input handler
  const handleNumpadClick = (value) => {
    if (value === 'x') {
      setPaidAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (value === '+/-') {
      // Toggle sign
      setPaidAmount((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    } else {
      setPaidAmount((prev) => (prev === '0' ? String(value) : prev + value));
    }
  };

  // Submit order to Kitchen (Unpaid)
  const sendToKitchen = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    const orderItemsString = cart.map(item => `${item.quantity} x ${item.name}`).join(', ');
    try {
      const newOrder = await addOrder({
        table: activeTable,
        amount: total,
        status: 'Unpaid',
        paymentMethod: '-',
        items: orderItemsString,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount
      });
      addLogEntry(`Sent Order ${newOrder.id} to Kitchen (Unpaid) for ${activeTable}: ${orderItemsString}`, 'warning');
      alert(`Order sent to Kitchen successfully for ${activeTable}!\\nTotal Amount: ₹${total}`);
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: { cart, appliedCoupon, discountAmount, paidAmount }
      }));
      if (activeTable !== 'Takeaway') {
        setTablesList(prev => {
          const updated = prev.map(t => t.name === activeTable ? { ...t, status: 'occupied' } : t);
          localStorage.setItem('floor_plan_tables', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send order to kitchen');
    }
  };

  const processPayment = async () => {
    try {
      const orderItemsString = cart.map(item => `${item.quantity} x ${item.name}`).join(', ');
      const newOrder = await addOrder({
        table: activeTable,
        amount: total,
        status: 'Paid',
        paymentMethod: selectedPayment,
        items: orderItemsString,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: discountAmount
      });
      addLogEntry(`Collected payment of ₹${total} via ${selectedPayment} for ${activeTable} (Order: ${newOrder.id})`, 'success');
      alert(`Payment of ₹${total} collected successfully via ${selectedPayment}!\\nTable: ${activeTable}`);
      setCart([]);
      setPaidAmount('0');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setTableCarts(prev => ({
        ...prev,
        [activeTable]: { cart: [], appliedCoupon: null, discountAmount: 0, paidAmount: '0' }
      }));
      if (activeTable !== 'Takeaway') {
        setTablesList(prev => {
          const updated = prev.map(t => t.name === activeTable ? { ...t, status: 'free' } : t);
          localStorage.setItem('floor_plan_tables', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to collect payment');
    }
  };

  // Collect Payment (Paid)
  const collectPayment = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (selectedPayment === 'UPI') {
      setIsQrModalOpen(true);
      return;
    }
    await processPayment();
  };

  // Search filter
  const filteredProducts = productsList.filter((p) =>
    p.category && selectedCategory && p.category.toLowerCase() === selectedCategory.toLowerCase() &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSidebarNavigation = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Styles matching the cafe theme
  const pageStyle = {
    display: 'flex',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-standard)',
    overflow: 'hidden',
    transition: 'background-color var(--transition-speed), color var(--transition-speed)',
  };

  const mainAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const headerStyle = {
    height: '70px',
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    gap: '20px',
    transition: 'background-color var(--transition-speed), border-color var(--transition-speed)',
  };

  const headerButtonsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconBtnStyle = {
    backgroundColor: 'var(--bg-button)',
    border: 'none',
    color: 'var(--text-primary)',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color var(--transition-speed), color var(--transition-speed)',
  };

  const tableSelectStyle = {
    backgroundColor: 'var(--bg-button)',
    border: 'none',
    color: 'var(--text-primary)',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    outline: 'none',
    cursor: 'pointer',
    transition: 'background-color var(--transition-speed), color var(--transition-speed)',
  };

  const bodyOrdersStyle = {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    height: 'calc(100vh - 70px)',
    overflowY: 'auto',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  };

  const thStyle = {
    padding: '16px 20px',
    textAlign: 'left',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    borderBottom: '2px solid var(--border-color)',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tdStyle = {
    padding: '16px 20px',
    borderBottom: '1.5px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '14.5px',
    verticalAlign: 'middle',
    textAlign: 'left'
  };

  const bodyGridStyle = {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '130px 1fr 360px 280px',
    height: 'calc(100vh - 70px)',
    overflow: 'hidden',
  };

  // Categories sidebar styling
  const categorySidebarStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px 8px',
    overflowY: 'auto',
    transition: 'background-color var(--transition-speed), border-color var(--transition-speed)',
  };

  const catBtnStyle = (isActive) => ({
    backgroundColor: isActive ? 'var(--border-focus)' : 'transparent',
    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
    border: 'none',
    padding: '14px 10px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all var(--transition-speed)',
  });

  // Product Grid container
  const productsContainerStyle = {
    padding: '24px',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gridAutoRows: 'max-content',
    gap: '16px',
  };

  const productCardStyle = (inStock) => ({
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '130px',
    cursor: inStock ? 'pointer' : 'not-allowed',
    border: '1.5px solid transparent',
    transition: 'all var(--transition-speed)',
    opacity: inStock ? 1 : 0.5,
    position: 'relative',
    textAlign: 'left',
  });

  const cartPanelStyle = {
    backgroundColor: 'var(--input-bg)',
    borderLeft: '1px solid var(--border-color)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    transition: 'background-color var(--transition-speed), border-color var(--transition-speed)',
  };

  const cartListStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  };

  const cartItemStyle = {
    backgroundColor: 'var(--bg-card)',
    padding: '14px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color var(--transition-speed)',
  };

  const paymentPanelStyle = {
    backgroundColor: 'var(--bg-card)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    transition: 'background-color var(--transition-speed)',
  };

  const payMethodBtnStyle = (isActive) => ({
    flex: 1,
    backgroundColor: isActive ? 'var(--border-focus)' : 'var(--bg-button)',
    color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all var(--transition-speed)',
  });

  const numpadButtonStyle = {
    backgroundColor: 'var(--bg-button)',
    border: 'none',
    color: 'var(--text-primary)',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '52px',
    transition: 'background-color var(--transition-speed), color var(--transition-speed)',
  };

  // Slide-out hamburger navigation menu styling
  const slideSidebarStyle = {
    position: 'fixed',
    top: 0,
    right: isSidebarOpen ? 0 : '-300px',
    width: '280px',
    height: '100vh',
    backgroundColor: 'var(--bg-card)',
    borderLeft: '1px solid var(--border-color)',
    boxShadow: 'var(--card-shadow)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 20px',
    transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background-color var(--transition-speed), border-color var(--transition-speed)',
  };

  const menuLinkStyle = {
    display: 'block',
    width: '100%',
    padding: '14px 16px',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all var(--transition-speed)',
  };

  return (
    <div style={pageStyle}>
      {/* Slide out hamburger Sidebar */}
      <div style={slideSidebarStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>POS Menu</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'products' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'products' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-products')}><Layers size={18} /> Products</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'categories' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'categories' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-categories')}><Grid size={18} /> Categories</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'payment-methods' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'payment-methods' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-payment-methods')}><CreditCard size={18} /> Payment Methods</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'coupons' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'coupons' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-coupons')}><Tag size={18} /> Coupons & Promos</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'bookings' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'bookings' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-bookings')}><Calendar size={18} /> Bookings & Tables</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'employees' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'employees' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-employees')}><User size={18} /> Staff / Employees</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: view === 'reports' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'reports' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-reports')}><BarChart2 size={18} /> Sales Reports</button>
          <button style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/kds')}><ChefHat size={18} /> Kitchen Display (KDS)</button>
        </div>
        <button
          onClick={handleLogout}
          style={{ ...menuLinkStyle, display: 'flex', alignItems: 'center', gap: '10px', color: '#d9534f', borderTop: '1px solid #28211b', borderRadius: 0, marginTop: 'auto' }}
        >
          <LogOut size={18} /> Log-Out
        </button>
      </div>

      <div style={mainAreaStyle}>
        {/* Top Header */}
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              onClick={() => navigate('/pos')}
              style={{
                backgroundColor: 'var(--border-focus)',
                color: 'var(--bg-primary)',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '18px',
                letterSpacing: '0.5px',
                cursor: 'pointer'
              }}
            >
              Café POS
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '10px 14px 10px 40px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#a0958a' }} />
            </div>
          </div>

          <div style={headerButtonsStyle}>
            {/* QR Code Payment Modal */}
      {isQrModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '20px',
            textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', width: '350px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: 'var(--text-primary)' }}>UPI Payment</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Scan the QR Code to pay ₹{total}</p>
            <div style={{ padding: '15px', background: '#fff', display: 'inline-block', borderRadius: '15px', marginBottom: '20px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant@upi&pn=Cafe&am=${total}&cu=INR`} alt="UPI QR Code" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { setIsQrModalOpen(false); processPayment(); }}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#10b981', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Takeaway / Table Selection Modal */}
            <button
              onClick={() => setIsTableModalOpen(true)}
              style={{
                backgroundColor: activeTable ? 'var(--border-focus)' : 'var(--bg-button)',
                color: activeTable ? 'var(--bg-primary)' : 'var(--text-primary)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Grid size={16} />
              {activeTable ? `Table: ${activeTable}` : 'Select Table'}
            </button>

            {/* Customer Navigation Button */}
            <button
              style={{
                ...iconBtnStyle,
                backgroundColor: view === 'orders' ? 'var(--border-focus)' : 'var(--bg-button)',
                color: view === 'orders' ? 'var(--bg-primary)' : 'var(--text-primary)'
              }}
              onClick={() => navigate('/pos-orders')}
              title="Go to POS Orders"
            >
              <User size={18} />
            </button>

            {/* Monitor/PC Navigation Button (Default POS Register) */}
            <button
              style={{
                ...iconBtnStyle,
                backgroundColor: view === 'pos' ? 'var(--border-focus)' : 'var(--bg-button)',
                color: view === 'pos' ? 'var(--bg-primary)' : 'var(--text-primary)'
              }}
              onClick={() => navigate('/pos')}
              title="Go to POS Register"
            >
              <Monitor size={18} />
            </button>

            {/* Layers/Stack Navigation Button (POS Products Management) */}
            <button
              style={{
                ...iconBtnStyle,
                backgroundColor: view === 'products' ? 'var(--border-focus)' : 'var(--bg-button)',
                color: view === 'products' ? 'var(--bg-primary)' : 'var(--text-primary)'
              }}
              onClick={() => navigate('/pos-products')}
              title="Go to POS Products Management"
            >
              <Layers size={18} />
            </button>

            {/* Theme Toggle Button */}
            <button
              style={iconBtnStyle}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--border-focus)',
              color: 'var(--bg-primary)',
              fontWeight: '700',
            }}>
              {user ? user.name.charAt(0) : 'E'}
            </div>

            {/* Hamburger menu */}
            <button style={iconBtnStyle} onClick={() => setIsSidebarOpen(true)}>
              <Menu size={18} />
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        {view === 'orders' ? (
          <POSOrdersHistory
            ordersList={ordersList}
            searchOrdersQuery={searchOrdersQuery}
            setSearchOrdersQuery={setSearchOrdersQuery}
            setSelectedOrderDetails={setSelectedOrderDetails}
          />
        ) : view === 'products' ? (
          <POSProductsManagement
            productsList={productsList}
            setProductsList={setProductsList}
            categoriesList={categoriesList}
            setCategoriesList={setCategoriesList}
            addLogEntry={addLogEntry}
            handleToggleStock={handleToggleStock}
            handleDeleteProduct={handleDeleteProduct}
            searchCatalogQuery={searchCatalogQuery}
            setSearchCatalogQuery={setSearchCatalogQuery}
            newProdName={newProdName}
            setNewProdName={setNewProdName}
            newProdPrice={newProdPrice}
            setNewProdPrice={setNewProdPrice}
            newProdCategory={newProdCategory}
            setNewProdCategory={setNewProdCategory}
            newProdDesc={newProdDesc}
            setNewProdDesc={setNewProdDesc}
          />
        ) : view === 'categories' ? (
          <POSCategoriesManagement
            categoriesList={categoriesList}
            setCategoriesList={setCategoriesList}
            addLogEntry={addLogEntry}
          />
        ) : view === 'payment-methods' ? (
          <POSPaymentMethodsManagement
            allPaymentMethods={allPaymentMethods}
            setAllPaymentMethods={setAllPaymentMethods}
            addLogEntry={addLogEntry}
          />
        ) : view === 'coupons' ? (
          <POSCouponsManagement
            allCouponsList={allCouponsList}
            setAllCouponsList={setAllCouponsList}
            addLogEntry={addLogEntry}
          />
        ) : view === 'bookings' ? (
          <POSBookingsManagement
            bookingsList={bookingsList}
            setBookingsList={setBookingsList}
            addLogEntry={addLogEntry}
            tablesList={tablesList}
          />
        ) : view === 'employees' ? (
          <POSEmployeesManagement
            allEmployeesList={allEmployeesList}
            setAllEmployeesList={setAllEmployeesList}
            attendanceLogsList={attendanceLogsList}
            setAttendanceLogsList={setAttendanceLogsList}
            addLogEntry={addLogEntry}
          />
        ) : view === 'reports' ? (
          <POSReports
            ordersList={ordersList}
            logs={logs}
            reloadManagementData={reloadManagementData}
          />
        ) : (
          <div style={bodyGridStyle}>

            {!activeTable ? (
              <div style={{
                gridColumn: 'span 2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderRadius: '16px',
                margin: '20px',
                border: '2px dashed var(--border-color)',
                color: 'var(--text-secondary)',
                gap: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(234, 88, 12, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--border-focus)',
                  marginBottom: '10px'
                }}>
                  <Grid size={40} />
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: '800' }}>Select Table First</h2>
                <p style={{ maxWidth: '440px', fontSize: '15px', lineHeight: '1.6' }}>
                  Please choose a dining table from the floor plan layout first to display menu products and start building the active order.
                </p>
                <button
                  onClick={() => setIsTableModalOpen(true)}
                  style={{
                    backgroundColor: 'var(--border-focus)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                >
                  Choose Table / Floor Plan
                </button>
              </div>
            ) : (
              <>
                {/* Categories Sidebar */}
                <div style={categorySidebarStyle}>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      style={catBtnStyle(selectedCategory === cat)}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setIsAddProductModalOpen(true)}
                      style={{
                        marginTop: 'auto',
                        backgroundColor: 'transparent',
                        border: '1.5px dashed var(--border-color)',
                        color: 'var(--text-secondary)',
                        padding: '10px 8px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--border-focus)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <PlusCircle size={14} />
                      Add Product
                    </button>
                  )}
                </div>

                {/* Product Items Grid */}
                <div style={productsContainerStyle}>
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      style={productCardStyle(p.inStock)}
                      onClick={() => addToCart(p)}
                      onMouseEnter={(e) => {
                        if (p.inStock) {
                          e.currentTarget.style.borderColor = 'var(--border-focus)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (p.inStock) {
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {/* Stock status indicator dot */}
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: p.inStock ? '#10b981' : '#ef4444',
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                      }} />

                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-link)' }}>
                        ₹{p.price}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Shopping Cart List */}
            <div style={cartPanelStyle}>
              <div style={cartListStyle}>
                {cart.map((item) => (
                  <div key={item.id} style={cartItemStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>₹{item.price} each</span>
                    </div>

                    {/* Quantity adjustment controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{
                          backgroundColor: 'var(--bg-button)',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '700',
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', width: '16px' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          backgroundColor: 'var(--bg-button)',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '700',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginLeft: '8px', minWidth: '40px', textAlign: 'right' }}>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations & Send to Kitchen */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                borderTop: '1px solid var(--border-color)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'background-color var(--transition-speed), border-color var(--transition-speed)',
              }}>
                {/* Actions row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Send to Kitchen button */}
                  <button
                    onClick={sendToKitchen}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-button)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all var(--transition-speed)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                  >
                    <Send size={15} />
                    Send to Kitchen (Unpaid)
                  </button>

                  {/* Collect Payment button */}
                  <button
                    onClick={collectPayment}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all var(--transition-speed)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                  >
                    <IndianRupee size={16} />
                    Collect Payment (Paid)
                  </button>
                </div>

                {/* Utility buttons row */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate('/pos-orders')}
                    style={{ flex: 1, backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => setIsDiscountModalOpen(true)}
                    style={{ flex: 1, backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}
                  >
                    Discount
                  </button>
                  <button
                    onClick={() => alert('Order printed.')}
                    style={{ flex: 1, backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}
                  >
                    Send
                  </button>
                </div>

                {/* Calculation math rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', transition: 'border-color var(--transition-speed)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Sub total</span>
                    <span>₹{subTotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: '700' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Discount ({appliedCoupon.code || 'Auto Promo'})</span>
                        <button
                          onClick={handleClearCoupon}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', padding: '0 2px', fontWeight: '700' }}
                          title="Remove coupon"
                        >
                          [Clear]
                        </button>
                      </div>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Tax(GST 5%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', marginTop: '4px', transition: 'color var(--transition-speed)' }}>
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Panel */}
            <div style={paymentPanelStyle}>
              {/* Header Tabs inside Payment Panel */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '14px' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2.5px solid var(--border-focus)',
                    color: 'var(--text-primary)',
                    fontWeight: '800',
                    cursor: 'default',
                    fontSize: '13.5px',
                  }}
                >
                  Checkout
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                {/* Quick Payment Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {paymentMethods.length === 0 ? (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No active payment methods.</span>
                    ) : (
                      paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          style={{
                            ...payMethodBtnStyle(selectedPayment === method.name),
                            flex: '1 1 calc(50% - 4px)',
                            minWidth: '95px'
                          }}
                          onClick={() => setSelectedPayment(method.name)}
                        >
                          {method.type === 'Cash' && <IndianRupee size={15} />}
                          {method.type === 'Card' && <Percent size={15} />}
                          {method.type === 'UPI' && <UserPlus size={15} />}
                          {!['Cash', 'Card', 'UPI'].includes(method.type) && <PlusCircle size={15} />}
                          {method.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Paid Amount indicator */}
                <div style={{ margin: '14px 0', textAlign: 'left' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700' }}>Amount</span>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--border-color)',
                    paddingBottom: '8px',
                    marginTop: '6px',
                    transition: 'color var(--transition-speed), border-color var(--transition-speed)',
                  }}>
                    ₹{paidAmount}
                  </div>
                </div>

                {/* Numeric Numpad */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      style={numpadButtonStyle}
                      onClick={() => handleNumpadClick(num)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    style={numpadButtonStyle}
                    onClick={() => handleNumpadClick('0')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
                  >
                    0
                  </button>

                  <button
                    style={numpadButtonStyle}
                    onClick={() => handleNumpadClick('+/-')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
                  >
                    +/-
                  </button>

                  <button
                    style={{ ...numpadButtonStyle, backgroundColor: '#d9534f', color: '#ffffff' }}
                    onClick={() => handleNumpadClick('x')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c9302c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#d9534f'}
                  >
                    &larr;
                  </button>
                </div>

                {/* Quick Action Payment options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px' }}>
                  <button
                    onClick={() => alert(`Prices set to base.`)}
                    style={{ backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-primary)', padding: '12px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}
                  >
                    Prices
                  </button>
                  <button
                    onClick={() => setIsDiscountModalOpen(true)}
                    style={{ backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-primary)', padding: '12px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}
                  >
                    Disc.
                  </button>
                  <button
                    onClick={() => alert(`Quantity multiplier ready.`)}
                    style={{ backgroundColor: 'var(--bg-button)', border: 'none', color: 'var(--text-primary)', padding: '12px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}
                  >
                    Qty
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Discount / Coupon Modal Overlay */}
      {isDiscountModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100
        }}>
          <div style={{
            width: '400px',
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-standard)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800' }}>Apply Coupon / Discount</span>
              <button
                onClick={() => {
                  setIsDiscountModalOpen(false);
                  setCouponInput('');
                }}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>

            {/* Input fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>Enter Coupon Code</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. NEW20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                    fontSize: '14px',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCouponCode(couponInput);
                    }
                  }}
                />
                <button
                  onClick={() => handleApplyCouponCode(couponInput)}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Available Coupons list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Available Store Coupons:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {(JSON.parse(localStorage.getItem('coupons_list')) || [
                  { id: '1', name: 'Summur Sale', type: 'Coupon', code: 'SUMMER20', discountType: 'Percentage', value: 20, minAmount: 100, targetType: 'All', targetValue: '', activated: true },
                  { id: '3', name: 'New user', type: 'Coupon', code: 'NEW20', discountType: 'Fixed Amount', value: 50, minAmount: 200, targetType: 'All', targetValue: '', activated: true }
                ]).filter(c => c.type === 'Coupon' && c.activated).map(coupon => (
                  <button
                    key={coupon.id}
                    onClick={() => {
                      if (subTotal < coupon.minAmount) {
                        alert(`Minimum order amount of ₹${coupon.minAmount} required.`);
                        return;
                      }
                      setAppliedCoupon(coupon);
                      setIsDiscountModalOpen(false);
                      setCouponInput('');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      opacity: subTotal < coupon.minAmount ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (subTotal >= coupon.minAmount) {
                        e.currentTarget.style.borderColor = 'var(--border-focus)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: '750' }}>
                      <span style={{ color: '#10b981' }}>{coupon.code}</span>
                      <span>{coupon.discountType === 'Percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {coupon.name} • Min Order: ₹{coupon.minAmount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {appliedCoupon && (
              <button
                onClick={() => {
                  handleClearCoupon();
                  setIsDiscountModalOpen(false);
                }}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Clear Current Coupon
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table & Floor Selector Modal Overlay */}
      {isTableModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100
        }}>
          <div style={{
            width: '600px',
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border-color)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-standard)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Select Table & Floor Plan</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Choose an active table session to start ordering</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setIsEditingLayout(!isEditingLayout)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: isEditingLayout ? 'var(--border-focus)' : 'var(--bg-button)',
                      color: isEditingLayout ? 'var(--bg-primary)' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isEditingLayout ? 'Done Editing' : 'Edit Layout'}
                  </button>
                )}
                <button
                  onClick={() => setIsTableModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Floor selection tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <button
                onClick={() => setActiveFloor(1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: activeFloor === 1 ? 'var(--border-focus)' : 'var(--bg-primary)',
                  color: activeFloor === 1 ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Ground Floor (Floor 1)
              </button>
              <button
                onClick={() => setActiveFloor(2)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: activeFloor === 2 ? 'var(--border-focus)' : 'var(--bg-primary)',
                  color: activeFloor === 2 ? 'var(--bg-primary)' : 'var(--text-primary)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Rooftop (Floor 2)
              </button>
              <button
                onClick={() => {
                  handleTableSelect('Takeaway');
                  addLogEntry(`Selected Takeaway Session`, 'info');
                  setIsTableModalOpen(false);
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                Takeaway
              </button>
            </div>

            {/* Add Table inline form for layout editing */}
            {isEditingLayout && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1.5px dashed var(--border-color)' }}>
                <input
                  type="text"
                  placeholder="New Table Name (e.g. Table 11)"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => {
                    if (!newTableName.trim()) return;
                    const name = newTableName.trim();
                    if (tablesList.some(t => t.name.toLowerCase() === name.toLowerCase())) {
                      alert('Table name already exists!');
                      return;
                    }
                    const newTable = {
                      id: `t_${Date.now()}`,
                      name,
                      floor: activeFloor,
                      status: 'free'
                    };
                    const updated = [...tablesList, newTable];
                    setTablesList(updated);
                    localStorage.setItem('floor_plan_tables', JSON.stringify(updated));
                    setNewTableName('');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--border-focus)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Add to Floor {activeFloor}
                </button>
              </div>
            )}

            {/* Tables Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              padding: '10px 0'
            }}>
              {(() => {
                const floorTables = tablesList.filter(t => t.floor === activeFloor);

                return floorTables.map((t) => {
                  // Determine styling based on table status
                  let statusColor = '#10b981'; // free
                  let statusBg = 'rgba(16, 185, 129, 0.1)';
                  if (t.status === 'occupied') {
                    statusColor = '#ef4444';
                    statusBg = 'rgba(239, 68, 68, 0.1)';
                  } else if (t.status === 'reserved') {
                    statusColor = '#f97316';
                    statusBg = 'rgba(249, 115, 22, 0.1)';
                  }

                  const isSelected = activeTable === t.name;

                  return (
                    <div key={t.id} style={{ position: 'relative' }}>
                      <button
                        onClick={() => {
                          if (isEditingLayout) return;
                          handleTableSelect(t.name);
                          addLogEntry(`Selected Table: ${t.name} (Floor ${activeFloor})`, 'info');
                          setIsTableModalOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          padding: '16px 10px',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid var(--border-focus)' : '1.5px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--bg-button)' : 'var(--bg-primary)',
                          cursor: isEditingLayout ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isEditingLayout) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = 'var(--border-focus)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isEditingLayout) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isSelected ? 'var(--border-focus)' : 'var(--border-color)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {t.name}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: statusBg,
                          color: statusColor
                        }}>
                          {t.status}
                        </span>
                      </button>
                      {isEditingLayout && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete table ${t.name}?`)) {
                              const updated = tablesList.filter(item => item.id !== t.id);
                              setTablesList(updated);
                              localStorage.setItem('floor_plan_tables', JSON.stringify(updated));
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#ff5c5c',
                            color: '#fff',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                          }}
                          title="Delete Table"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {isAddProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100
        }}>
          <form
            onSubmit={handleAddNewProduct}
            style={{
              width: '450px',
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: '24px',
              padding: '30px',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-standard)',
              textAlign: 'left'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Add New POS Product</h3>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>

            {/* Product Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Masala Dosa"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Product Price */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 120"
                required
                min="0"
                step="0.01"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Category Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Category *</label>
              <select
                required
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Category</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Description</label>
              <textarea
                placeholder="Brief description of product details..."
                rows="3"
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'var(--border-focus)',
                  color: 'var(--bg-primary)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Order Details Modal Overlay */}
      {selectedOrderDetails && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100
        }}>
          <div style={{
            width: '450px',
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border-color)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-standard)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Order Details: {selectedOrderDetails.id}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(selectedOrderDetails.dateTime).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                &times;
              </button>
            </div>

            {/* Content Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dining Table:</span>
                <span style={{ fontWeight: '750' }}>{selectedOrderDetails.table || 'Takeaway'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Profile:</span>
                <span style={{ fontWeight: '750' }}>{selectedOrderDetails.customerName || 'Walk-in Customer'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span style={{ fontWeight: '750' }}>{selectedOrderDetails.paymentMethod || 'None (Unpaid)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction Status:</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: selectedOrderDetails.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: selectedOrderDetails.status === 'Paid' ? '#10b981' : '#ef4444'
                }}>
                  {selectedOrderDetails.status}
                </span>
              </div>

              {/* Items Summary list */}
              <div style={{
                borderTop: '1px dashed var(--border-color)',
                borderBottom: '1px dashed var(--border-color)',
                padding: '12px 0',
                margin: '6px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>ITEMS ORDERED</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedOrderDetails.items.split(', ').map((itemStr, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>{itemStr}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                <span>Grand Total:</span>
                <span>₹{selectedOrderDetails.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => alert(`Receipt printed for order ${selectedOrderDetails.id}`)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Print Receipt
              </button>

              {selectedOrderDetails.status === 'Unpaid' ? (
                <button
                  onClick={() => {
                    const stored = localStorage.getItem('orders');
                    if (stored) {
                      try {
                        const list = JSON.parse(stored);
                        const updated = list.map(o => {
                          if (o.id === selectedOrderDetails.id) {
                            return { ...o, status: 'Paid', paymentMethod: 'Cash' };
                          }
                          return o;
                        });
                        localStorage.setItem('orders', JSON.stringify(updated));
                        addLogEntry(`Order ${selectedOrderDetails.id} marked as Paid (Settled)`, 'success');
                        alert(`Order ${selectedOrderDetails.id} settled successfully!`);

                        if (selectedOrderDetails.customerName && selectedOrderDetails.customerName !== 'Walk-in Customer') {
                          const custStored = localStorage.getItem('customers');
                          if (custStored) {
                            const custs = JSON.parse(custStored);
                            const updatedCusts = custs.map(c => {
                              if (c.name === selectedOrderDetails.customerName) {
                                return {
                                  ...c,
                                  spend: (c.spend || 0) + selectedOrderDetails.amount,
                                  ordersCount: (c.ordersCount || 0) + 1
                                };
                              }
                              return c;
                            });
                            localStorage.setItem('customers', JSON.stringify(updatedCusts));
                          }
                        }

                        setSelectedOrderDetails({ ...selectedOrderDetails, status: 'Paid', paymentMethod: 'Cash' });
                        setOrdersList(updated);
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Mark as Paid
                </button>
              ) : (
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--border-focus)',
                    color: 'var(--bg-primary)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Close View
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
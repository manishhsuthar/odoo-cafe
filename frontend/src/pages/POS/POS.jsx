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
  Percent 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { getCategories, getProducts, addOrder, getCoupons, addCoupon, updateCoupon, deleteCoupon, getEmployees, addEmployee, deleteEmployee, getPaymentMethods, getOrders } from '../../utils/db';

const POS = ({ view = 'pos' }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Load from API
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [couponList, setCouponList] = useState([]);
  
  // Session Logs states
  const [logs, setLogs] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState('checkout');

  // POS Orders History states
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [searchOrdersQuery, setSearchOrdersQuery] = useState('');

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrdersList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setOrdersList([]);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // POS Products states and handlers
  const [searchCatalogQuery, setSearchCatalogQuery] = useState('');

  // POS Categories states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ea580c');
  const [searchCategoriesQuery, setSearchCategoriesQuery] = useState('');

  // POS Payment Methods states
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentType, setNewPaymentType] = useState('Cash');
  const [newPaymentValue, setNewPaymentValue] = useState('');
  const [searchPaymentQuery, setSearchPaymentQuery] = useState('');

  // POS Coupons & Promos states
  const [allCouponsList, setAllCouponsList] = useState([]);
  const [newCouponName, setNewCouponName] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponDiscountType, setNewCouponDiscountType] = useState('Percentage');
  const [newCouponMinAmount, setNewCouponMinAmount] = useState('');
  const [searchCouponsQuery, setSearchCouponsQuery] = useState('');

  // POS Bookings & Tables states
  const [bookingsList, setBookingsList] = useState([]);
  const [newBookingCustomer, setNewBookingCustomer] = useState('');
  const [newBookingPhone, setNewBookingPhone] = useState('');
  const [newBookingDateTime, setNewBookingDateTime] = useState('');
  const [newBookingGuests, setNewBookingGuests] = useState('2');
  const [newBookingTable, setNewBookingTable] = useState('');
  const [searchBookingsQuery, setSearchBookingsQuery] = useState('');

  // POS Employees states
  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [attendanceLogsList, setAttendanceLogsList] = useState([]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Chef');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [searchEmployeesQuery, setSearchEmployeesQuery] = useState('');

  // Combined management loader
  const reloadManagementData = async () => {
    // Payment methods
    try {
      const pmData = await getPaymentMethods();
      setAllPaymentMethods(pmData);
    } catch (e) {
      setAllPaymentMethods([]);
    }
    // Coupons list
    try {
      const cpData = await getCoupons();
      setAllCouponsList(cpData);
    } catch (e) {
      setAllCouponsList([]);
    }
    // Bookings
    const bkStored = localStorage.getItem('pos_bookings');
    if (bkStored) {
      try {
        setBookingsList(JSON.parse(bkStored));
      } catch (e) {
        setBookingsList([]);
      }
    } else {
      setBookingsList([]);
    }
    // Employees
    try {
      const empData = await getEmployees();
      setAllEmployeesList(empData);
    } catch (e) {
      setAllEmployeesList([]);
    }
    // Shift Attendance Logs
    const shStored = localStorage.getItem('employee_logs');
    if (shStored) {
      try {
        setAttendanceLogsList(JSON.parse(shStored));
      } catch (e) {
        setAttendanceLogsList([]);
      }
    }
  };

  useEffect(() => {
    reloadManagementData();
  }, []);

  const handleToggleStock = (prodId) => {
    const updated = productsList.map(p => {
      if (p.id === prodId) {
        const newStock = !p.inStock;
        addLogEntry(`Product "${p.name}" marked as ${newStock ? 'In Stock' : 'Out of Stock'}`, 'info');
        return { ...p, inStock: newStock };
      }
      return p;
    });
    saveProducts(updated);
    setProductsList(updated);
  };

  const handleDeleteProduct = (prodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const prod = productsList.find(p => p.id === prodId);
      const updated = productsList.filter(p => p.id !== prodId);
      saveProducts(updated);
      setProductsList(updated);
      if (prod) {
        addLogEntry(`Deleted product "${prod.name}"`, 'danger');
      }
    }
  };

  // Categories Handlers
  const handleAddCategory = (e) => {
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

  const handleDeleteCategory = (catName) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const current = JSON.parse(localStorage.getItem('categories') || '[]');
      const updated = current.filter(c => c.name !== catName);
      localStorage.setItem('categories', JSON.stringify(updated));
      setCategoriesList(updated.map(c => c.name));
      addLogEntry(`Deleted category: ${catName}`, 'danger');
    }
  };

  // Payment Methods Handlers
  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    if (!newPaymentName) return;
    const newPM = {
      id: `pm_${Date.now()}`,
      name: newPaymentName,
      type: newPaymentType,
      value: newPaymentValue,
      activated: true
    };
    const updated = [...allPaymentMethods, newPM];
    localStorage.setItem('payment_methods', JSON.stringify(updated));
    setAllPaymentMethods(updated);
    setNewPaymentName('');
    setNewPaymentValue('');
    addLogEntry(`Added payment method: ${newPM.name}`, 'success');
    alert('Payment method added successfully!');
  };

  const handleTogglePaymentMethod = (pmId) => {
    const updated = allPaymentMethods.map(pm => {
      if (pm.id === pmId) {
        const newAct = !pm.activated;
        addLogEntry(`Payment method ${pm.name} marked as ${newAct ? 'Active' : 'Inactive'}`, 'info');
        return { ...pm, activated: newAct };
      }
      return pm;
    });
    localStorage.setItem('payment_methods', JSON.stringify(updated));
    setAllPaymentMethods(updated);
  };

  const handleDeletePaymentMethod = (pmId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      const pm = allPaymentMethods.find(p => p.id === pmId);
      const updated = allPaymentMethods.filter(p => p.id !== pmId);
      localStorage.setItem('payment_methods', JSON.stringify(updated));
      setAllPaymentMethods(updated);
      if (pm) addLogEntry(`Deleted payment method ${pm.name}`, 'danger');
    }
  };

  // Coupons Handlers
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponName || !newCouponCode || !newCouponValue) return;
    try {
      const created = await addCoupon({
        name: newCouponName,
        code: newCouponCode.toUpperCase(),
        value: parseFloat(newCouponValue),
        discount_type: newCouponDiscountType,
        min_amount: parseFloat(newCouponMinAmount || 0),
        activated: true
      });
      const list = await getCoupons();
      setAllCouponsList(list);
      setCouponList(list);
      setNewCouponName('');
      setNewCouponCode('');
      setNewCouponValue('');
      setNewCouponMinAmount('');
      addLogEntry(`Added coupon code: ${created.code}`, 'success');
      alert('Coupon added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add coupon');
    }
  };

  const handleToggleCoupon = async (cpId) => {
    const cp = allCouponsList.find(c => c.id === cpId);
    if (!cp) return;
    try {
      const updated = await updateCoupon(cpId, {
        activated: !cp.activated
      });
      const list = await getCoupons();
      setAllCouponsList(list);
      setCouponList(list);
      addLogEntry(`Coupon ${updated.code} marked as ${updated.activated ? 'Active' : 'Inactive'}`, 'info');
    } catch (err) {
      console.error(err);
      alert('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (cpId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const cp = allCouponsList.find(c => c.id === cpId);
        await deleteCoupon(cpId);
        const list = await getCoupons();
        setAllCouponsList(list);
        setCouponList(list);
        if (cp) addLogEntry(`Deleted coupon ${cp.code}`, 'danger');
      } catch (err) {
        console.error(err);
        alert('Failed to delete coupon');
      }
    }
  };

  // Bookings Handlers
  const handleAddBooking = (e) => {
    e.preventDefault();
    if (!newBookingCustomer || !newBookingPhone || !newBookingDateTime) return;
    const newBK = {
      id: `bk_${Date.now()}`,
      customerName: newBookingCustomer,
      phone: newBookingPhone,
      dateTime: newBookingDateTime,
      guests: parseInt(newBookingGuests || 2),
      table: newBookingTable || 'Unassigned',
      status: 'Pending'
    };
    const updated = [...bookingsList, newBK];
    localStorage.setItem('pos_bookings', JSON.stringify(updated));
    setBookingsList(updated);
    setNewBookingCustomer('');
    setNewBookingPhone('');
    setNewBookingDateTime('');
    setNewBookingTable('');
    addLogEntry(`Booked table for customer: ${newBK.customerName}`, 'success');
    alert('Table booking added successfully!');
  };

  const handleUpdateBookingStatus = (bkId, status) => {
    const updated = bookingsList.map(bk => {
      if (bk.id === bkId) {
        addLogEntry(`Booking for ${bk.customerName} set to ${status}`, 'info');
        return { ...bk, status };
      }
      return bk;
    });
    localStorage.setItem('pos_bookings', JSON.stringify(updated));
    setBookingsList(updated);
  };

  const handleDeleteBooking = (bkId) => {
    if (window.confirm('Are you sure you want to delete this booking reservation?')) {
      const bk = bookingsList.find(b => b.id === bkId);
      const updated = bookingsList.filter(b => b.id !== bkId);
      localStorage.setItem('pos_bookings', JSON.stringify(updated));
      setBookingsList(updated);
      if (bk) addLogEntry(`Deleted booking for ${bk.customerName}`, 'danger');
    }
  };

  // Employees Handlers
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpPassword) return;
    try {
      const created = await addEmployee({
        name: newEmpName,
        email: newEmpEmail,
        role: newEmpRole,
        password: newEmpPassword
      });
      const list = await getEmployees();
      setAllEmployeesList(list);
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpPassword('');
      addLogEntry(`Added employee: ${created.fullName || created.email} (${created.role})`, 'success');
      alert('Employee registered successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to register employee');
    }
  };

  const handleDeleteEmployee = async (empId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const emp = allEmployeesList.find(e => e.id === empId);
        await deleteEmployee(empId);
        const list = await getEmployees();
        setAllEmployeesList(list);
        if (emp) addLogEntry(`Deleted employee ${emp.fullName || emp.email}`, 'danger');
      } catch (err) {
        console.error(err);
        alert('Failed to delete employee');
      }
    }
  };

  const handleToggleShift = (logId) => {
    const updated = attendanceLogsList.map(log => {
      if (log.id === logId) {
        const isCurrentlyActive = !log.logoutTime;
        return {
          ...log,
          logoutTime: isCurrentlyActive ? new Date().toISOString() : null
        };
      }
      return log;
    });
    localStorage.setItem('employee_logs', JSON.stringify(updated));
    setAttendanceLogsList(updated);
    addLogEntry(`Toggled shift status for log ID ${logId}`, 'info');
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
    (async () => {
      const [cats, prods, pmData, coupData] = await Promise.all([
        getCategories().catch(() => []),
        getProducts().catch(() => []),
        getPaymentMethods().catch(() => []),
        getCoupons().catch(() => []),
      ]);
      setCouponList(Array.isArray(coupData) ? coupData : []);
      setCategoriesList(cats.map(c => c.name));
      setProductsList(prods);
      if (cats.length > 0) {
        setSelectedCategory(cats[0].name);
      }
      const list = Array.isArray(pmData) ? pmData : [];
      const active = list.filter(m => m.activated).map(m => ({
        ...m,
        name: m.name || m.type
      }));
      setPaymentMethods(active);
      if (active.length > 0) {
        setSelectedPayment(active[0].name);
      }
    })();

    // Load session logs
    const storedLogs = localStorage.getItem('pos_session_logs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch { setLogs([]); }
    } else {
      setLogs([]);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Table Floor Plan modal
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeFloor, setActiveFloor] = useState(1);

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
    if (appliedCoupon && appliedCoupon.type === 'Coupon') return;

    getCoupons().then(list => {
      const autoPromos = (list || []).filter(c => c.type === 'Automated Promo' && c.activated && subTotal >= (c.minAmount || 0));
      if (autoPromos.length > 0) {
        const bestPromo = autoPromos.sort((a, b) => b.value - a.value)[0];
        setAppliedCoupon(bestPromo);
      } else if (appliedCoupon && appliedCoupon.type === 'Automated Promo') {
        setAppliedCoupon(null);
      }
    }).catch(() => {});
  }, [subTotal, cart]);

  const totalBeforeTax = Math.max(0, subTotal - discountAmount);
  const tax = Math.round(totalBeforeTax * 0.05); // 5% GST
  const total = totalBeforeTax + tax;

  useEffect(() => {
    setPaidAmount(total.toString());
  }, [total]);

  const handleApplyCouponCode = async (codeStr) => {
    if (!codeStr.trim()) {
      alert('Please enter a coupon code.');
      return;
    }
    let couponsList = [];
    try {
      couponsList = await getCoupons();
    } catch {
      couponsList = [];
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

  const handleAddNewProduct = (e) => {
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
    const saved = addProduct(newProd);
    addLogEntry(`Created and added new product: ${saved.name} to ${saved.category}`, 'success');
    
    // Refresh product lists
    const prods = getProducts();
    setProductsList(prods);

    // Refresh categories in case it is new
    const cats = getCategories();
    setCategoriesList(cats.map(c => c.name));

    // Clear form & close modal
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCategory('');
    setNewProdDesc('');
    setIsAddProductModalOpen(false);
    alert('Product added successfully!');
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
    const newOrder = await addOrder({
      table: activeTable,
      amount: total,
      status: 'Unpaid',
      payment_method: '-',
      items: orderItemsString,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: discountAmount
    });
    addLogEntry(`Sent Order ${newOrder.id} to Kitchen (Unpaid) for ${activeTable}: ${orderItemsString}`, 'warning');
    alert(`Order sent to Kitchen successfully for ${activeTable}!\nTotal Amount: ₹${total}`);
    setCart([]);
    setPaidAmount('0');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    await loadOrders();
  };

  // Collect Payment (Paid)
  const collectPayment = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    const orderItemsString = cart.map(item => `${item.quantity} x ${item.name}`).join(', ');
    const newOrder = await addOrder({
      table: activeTable,
      amount: total,
      status: 'Paid',
      payment_method: selectedPayment,
      items: orderItemsString,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: discountAmount
    });
    addLogEntry(`Collected payment of ₹${total} via ${selectedPayment} for ${activeTable} (Order: ${newOrder.id})`, 'success');
    alert(`Payment of ₹${total} collected successfully via ${selectedPayment}!\nTable: ${activeTable}`);
    setCart([]);
    setPaidAmount('0');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    await loadOrders();
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
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'products' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'products' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-products')}>Products</button>
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'categories' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'categories' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-categories')}>Categories</button>
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'payment-methods' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'payment-methods' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-payment-methods')}>Payment Methods</button>
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'coupons' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'coupons' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-coupons')}>Coupons & Promos</button>
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'bookings' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'bookings' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-bookings')}>Bookings & Tables</button>
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'employees' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'employees' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-employees')}>Staff / Employees</button>
          <button style={{ ...menuLinkStyle, backgroundColor: view === 'reports' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: view === 'reports' ? 'var(--border-focus)' : 'var(--text-secondary)' }} onClick={() => handleSidebarNavigation('/pos-reports')}>Sales Reports</button>
        </div>
        <button 
          onClick={handleLogout}
          style={{ ...menuLinkStyle, color: '#d9534f', borderTop: '1px solid #28211b', borderRadius: 0, marginTop: 'auto' }}
        >
          Log-Out
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
            {/* Table Dropdown selection */}
            <select
              value={activeTable}
              onChange={(e) => setActiveTable(e.target.value)}
              style={tableSelectStyle}
            >
              <option value="Table 1">Table 1</option>
              <option value="Table 4">Table 4</option>
              <option value="Table 6">Table 6</option>
              <option value="Table 12">Table 12</option>
              <option value="Takeaway">Takeaway</option>
            </select>

            <button style={iconBtnStyle} onClick={() => alert('Cash register drawer is open.')}>
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
          <div style={bodyOrdersStyle}>
            {/* Search and Title row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Orders History</h2>
              
              {/* Search input for orders */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                transition: 'border-color 0.2s',
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search by Customer Name, Order ID, or Date..."
                  value={searchOrdersQuery}
                  onChange={(e) => setSearchOrdersQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Orders Log Table container */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--card-shadow)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                color: 'var(--text-primary)',
                fontSize: '14.5px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '2px solid var(--border-color)'
                  }}>
                    <th style={thStyle}>Date & Time</th>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Table</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = ordersList.filter((ord) => {
                      const q = searchOrdersQuery.toLowerCase();
                      const customer = (ord.customerName || 'Walk-in Customer').toLowerCase();
                      const orderId = (ord.id || '').toLowerCase();
                      const table = (ord.table || 'Takeaway').toLowerCase();
                      
                      const dateObj = new Date(ord.dateTime);
                      const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                      const dateFull = dateObj.toLocaleDateString().toLowerCase();

                      return (
                        customer.includes(q) ||
                        orderId.includes(q) ||
                        table.includes(q) ||
                        dateStr.includes(q) ||
                        dateFull.includes(q)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No orders found matching search criteria.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((ord) => {
                      const dateObj = new Date(ord.dateTime);
                      const dateFormatted = `${dateObj.getDate()}/${dateObj.getMonth() + 1} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                      const isPaid = ord.status === 'Paid';
                      
                      return (
                        <tr 
                          key={ord.id}
                          onClick={() => setSelectedOrderDetails(ord)}
                          style={{
                            borderBottom: '1.5px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={tdStyle}>{dateFormatted}</td>
                          <td style={{ ...tdStyle, color: '#3b82f6', fontWeight: '800' }}>{ord.id}</td>
                          <td style={tdStyle}>{ord.table || 'Takeaway'}</td>
                          <td style={tdStyle}>{ord.customerName || 'Walk-in Customer'}</td>
                          <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750' }}>₹{ord.amount}</td>
                          <td style={tdStyle}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isPaid ? '#10b981' : '#ef4444'
                            }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ) : view === 'products' ? (
          <div style={bodyOrdersStyle}>
            {/* Products Page Header / Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Products Management</h2>
              
              {/* Search input for products catalog */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                transition: 'border-color 0.2s',
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search products by name or category..."
                  value={searchCatalogQuery}
                  onChange={(e) => setSearchCatalogQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Split layout: Left column Add Form, Right column Catalog List */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Add Product Form Card */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
                  Add New Product
                </h3>
                
                <form onSubmit={(e) => {
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
                  const saved = addProduct(newProd);
                  addLogEntry(`Created and added new product: ${saved.name} to ${saved.category}`, 'success');
                  
                  // Refresh product lists
                  const prods = getProducts();
                  setProductsList(prods);

                  // Refresh categories list
                  const cats = getCategories();
                  setCategoriesList(cats.map(c => c.name));

                  // Clear form
                  setNewProdName('');
                  setNewProdPrice('');
                  setNewProdCategory('');
                  setNewProdDesc('');
                  alert('Product added successfully!');
                }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  
                  {/* Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Masala Dosa"
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

                  {/* Price */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Price (₹) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="e.g. 120"
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

                  {/* Category */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Category *</label>
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
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Description</label>
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

                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Add Product to Catalog
                  </button>
                </form>
              </div>

              {/* Right Column: Products Catalog List Card */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14.5px'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '2px solid var(--border-color)'
                    }}>
                      <th style={thStyle}>Product Name</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Price</th>
                      <th style={thStyle}>Stock Status</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = productsList.filter((prod) => {
                        const q = searchCatalogQuery.toLowerCase();
                        const name = (prod.name || '').toLowerCase();
                        const cat = (prod.category || '').toLowerCase();
                        return name.includes(q) || cat.includes(q);
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No products found in the catalog.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((prod) => {
                        return (
                          <tr 
                            key={prod.id}
                            style={{
                              borderBottom: '1.5px solid var(--border-color)',
                              transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ ...tdStyle, fontWeight: '700' }}>{prod.name}</td>
                            <td style={tdStyle}>{prod.category}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750' }}>₹{prod.price}</td>
                            <td style={tdStyle}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: prod.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: prod.inStock ? '#10b981' : '#ef4444'
                              }}>
                                {prod.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button
                                  onClick={() => handleToggleStock(prod.id)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: prod.inStock ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                    color: prod.inStock ? '#ef4444' : '#10b981',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  {prod.inStock ? 'Set Out of Stock' : 'Set In Stock'}
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s'
                                  }}
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        ) : view === 'categories' ? (
          <div style={bodyOrdersStyle}>
            {/* Categories Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Categories Management</h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search categories..."
                  value={searchCategoriesQuery}
                  onChange={(e) => setSearchCategoriesQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" />
              </div>
            </div>

            {/* Split layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Add Category Form */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
                  Add New Category
                </h3>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Desserts"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Color Badge Theme *</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['#ea580c', '#0d9488', '#7c3aed', '#b45309', '#db2777', '#2563eb', '#16a34a', '#dc2626'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: newCategoryColor === color ? '3px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            transform: newCategoryColor === color ? 'scale(1.15)' : 'none',
                            transition: 'all 0.15s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* Right Column: Categories List */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={thStyle}>Category Name</th>
                      <th style={thStyle}>Color Tag</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = categoriesList.filter(cat => 
                        cat.toLowerCase().includes(searchCategoriesQuery.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No categories found.
                            </td>
                          </tr>
                        );
                      }
                      // Find colors from all categories loaded
                      const catsDetails = JSON.parse(localStorage.getItem('categories') || '[]');
                      return filtered.map(catName => {
                        const detail = catsDetails.find(d => d.name === catName) || { color: '#888' };
                        return (
                          <tr key={catName} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                            <td style={{ ...tdStyle, fontWeight: '700' }}>{catName}</td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: detail.color }} />
                                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{detail.color}</span>
                              </div>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteCategory(catName)}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : view === 'payment-methods' ? (
          <div style={bodyOrdersStyle}>
            {/* Payment Methods Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Payment Methods</h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search payment methods..."
                  value={searchPaymentQuery}
                  onChange={(e) => setSearchPaymentQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Add Payment Method */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
                  Add Payment Method
                </h3>
                <form onSubmit={handleAddPaymentMethod} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Method Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PhonePe UPI"
                      value={newPaymentName}
                      onChange={(e) => setNewPaymentName(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Type *</label>
                    <select
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value)}
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
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Wallet">Digital Wallet</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Gateway details (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. merchant@ybl"
                      value={newPaymentValue}
                      onChange={(e) => setNewPaymentValue(e.target.value)}
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
                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Register Payment Mode
                  </button>
                </form>
              </div>

              {/* Right Column: Payment Methods List */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={thStyle}>Method Name</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Gateway info</th>
                      <th style={thStyle}>Status</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = allPaymentMethods.filter(pm => 
                        (pm.name || '').toLowerCase().includes(searchPaymentQuery.toLowerCase()) ||
                        (pm.type || '').toLowerCase().includes(searchPaymentQuery.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No payment methods registered.
                            </td>
                          </tr>
                        );
                      }
                      return filtered.map(pm => (
                        <tr key={pm.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                          <td style={{ ...tdStyle, fontWeight: '700' }}>{pm.name}</td>
                          <td style={tdStyle}>{pm.type}</td>
                          <td style={{ ...tdStyle, fontFamily: 'var(--mono)', fontSize: '13px' }}>{pm.value || '-'}</td>
                          <td style={tdStyle}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: pm.activated ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: pm.activated ? '#10b981' : '#ef4444'
                            }}>
                              {pm.activated ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <button
                                onClick={() => handleTogglePaymentMethod(pm.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: pm.activated ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                  color: pm.activated ? '#ef4444' : '#10b981',
                                  fontSize: '12px',
                                  fontWeight: '850',
                                  cursor: 'pointer'
                                }}
                              >
                                {pm.activated ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeletePaymentMethod(pm.id)}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : view === 'coupons' ? (
          <div style={bodyOrdersStyle}>
            {/* Coupons & Promotions Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Coupons & Promos</h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search coupons by code or name..."
                  value={searchCouponsQuery}
                  onChange={(e) => setSearchCouponsQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Add Coupon Form */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
                  Create Coupon / Promo
                </h3>
                <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Promotion Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Festival Special Offer"
                      value={newCouponName}
                      onChange={(e) => setNewCouponName(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DIWALI50"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Type *</label>
                      <select
                        value={newCouponDiscountType}
                        onChange={(e) => setNewCouponDiscountType(e.target.value)}
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
                        <option value="Percentage">Percent (%)</option>
                        <option value="Fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Value *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 20"
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
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
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Min Order Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 300"
                      value={newCouponMinAmount}
                      onChange={(e) => setNewCouponMinAmount(e.target.value)}
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
                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Create Promo Coupon
                  </button>
                </form>
              </div>

              {/* Right Column: Coupons List */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={thStyle}>Promo Name</th>
                      <th style={thStyle}>Coupon Code</th>
                      <th style={thStyle}>Value Off</th>
                      <th style={thStyle}>Min. Order</th>
                      <th style={thStyle}>Status</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = allCouponsList.filter(cp => 
                        (cp.name || '').toLowerCase().includes(searchCouponsQuery.toLowerCase()) ||
                        (cp.code || '').toLowerCase().includes(searchCouponsQuery.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No coupon promo codes created.
                            </td>
                          </tr>
                        );
                      }
                      return filtered.map(cp => (
                        <tr key={cp.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                          <td style={{ ...tdStyle, fontWeight: '700' }}>{cp.name}</td>
                          <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750', fontFamily: 'var(--mono)' }}>{cp.code}</td>
                          <td style={tdStyle}>{cp.discountType === 'Percentage' ? `${cp.value}%` : `₹${cp.value}`} Off</td>
                          <td style={tdStyle}>₹{cp.minAmount || '0'}</td>
                          <td style={tdStyle}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: cp.activated ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: cp.activated ? '#10b981' : '#ef4444'
                            }}>
                              {cp.activated ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                              <button
                                onClick={() => handleToggleCoupon(cp.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: cp.activated ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                  color: cp.activated ? '#ef4444' : '#10b981',
                                  fontSize: '12px',
                                  fontWeight: '850',
                                  cursor: 'pointer'
                                }}
                              >
                                {cp.activated ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(cp.id)}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : view === 'bookings' ? (
          <div style={bodyOrdersStyle}>
            {/* Bookings & Reservations Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Bookings & Reservations</h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search bookings by customer name..."
                  value={searchBookingsQuery}
                  onChange={(e) => setSearchBookingsQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Add Booking Form */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
                  Reserve a Table
                </h3>
                <form onSubmit={handleAddBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newBookingCustomer}
                      onChange={(e) => setNewBookingCustomer(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Contact Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={newBookingPhone}
                      onChange={(e) => setNewBookingPhone(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newBookingDateTime}
                      onChange={(e) => setNewBookingDateTime(e.target.value)}
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
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Guests count</label>
                      <input
                        type="number"
                        min="1"
                        value={newBookingGuests}
                        onChange={(e) => setNewBookingGuests(e.target.value)}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Table Select</label>
                      <select
                        value={newBookingTable}
                        onChange={(e) => setNewBookingTable(e.target.value)}
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
                        <option value="">Unassigned</option>
                        {Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`).map(tName => (
                          <option key={tName} value={tName}>{tName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>

              {/* Right Column: Bookings List */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={thStyle}>Customer</th>
                      <th style={thStyle}>Contact</th>
                      <th style={thStyle}>Booking Date & Time</th>
                      <th style={thStyle}>Seating</th>
                      <th style={thStyle}>Status</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = bookingsList.filter(bk => 
                        (bk.customerName || '').toLowerCase().includes(searchBookingsQuery.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No table reservations booked.
                            </td>
                          </tr>
                        );
                      }
                      return filtered.map(bk => (
                        <tr key={bk.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                          <td style={{ ...tdStyle, fontWeight: '700' }}>{bk.customerName}</td>
                          <td style={tdStyle}>{bk.phone}</td>
                          <td style={tdStyle}>{new Date(bk.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                          <td style={{ ...tdStyle, fontWeight: '650' }}>{bk.table} ({bk.guests} Guests)</td>
                          <td style={tdStyle}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: 
                                bk.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.1)' : 
                                bk.status === 'Pending' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: 
                                bk.status === 'Confirmed' ? '#10b981' : 
                                bk.status === 'Pending' ? '#ea580c' : '#ef4444'
                            }}>
                              {bk.status}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              {bk.status !== 'Confirmed' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(bk.id, 'Confirmed')}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Accept
                                </button>
                              )}
                              {bk.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(bk.id, 'Cancelled')}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(bk.id)}
                                style={{
                                  padding: '4px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : view === 'employees' ? (
          <div style={bodyOrdersStyle}>
            {/* Employees Management Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Staff Attendance & Employees Directory</h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'var(--input-bg)', 
                border: '1.5px solid var(--border-color)', 
                borderRadius: '20px', 
                padding: '10px 18px', 
                width: '450px', 
                position: 'relative'
              }}>
                <input 
                  type="text"
                  placeholder="Search staff members..."
                  value={searchEmployeesQuery}
                  onChange={(e) => setSearchEmployeesQuery(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
                <Search size={18} color="var(--text-secondary)" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Register Employee */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
                  Register New Staff
                </h3>
                <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Employee Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@cafe.com"
                      value={newEmpEmail}
                      onChange={(e) => setNewEmpEmail(e.target.value)}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Designated Role *</label>
                    <select
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
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
                      <option value="Chef">Chef</option>
                      <option value="Manager">Manager</option>
                      <option value="Cashier">Cashier</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Access Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newEmpPassword}
                      onChange={(e) => setNewEmpPassword(e.target.value)}
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
                  <button
                    type="submit"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--border-focus)',
                      color: 'var(--bg-primary)',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                      textAlign: 'center'
                    }}
                  >
                    Register Employee
                  </button>
                </form>
              </div>

              {/* Right Column: Employees Directory & Shift Attendance Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Employees Directory Table */}
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'var(--card-shadow)',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border-color)', fontSize: '16px', fontWeight: '800', textAlign: 'left' }}>
                    Staff Members Directory
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={thStyle}>Staff Name</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Role Badge</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = allEmployeesList.filter(emp => 
                          (emp.name || '').toLowerCase().includes(searchEmployeesQuery.toLowerCase()) ||
                          (emp.role || '').toLowerCase().includes(searchEmployeesQuery.toLowerCase())
                        );
                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No employees matched query.
                              </td>
                            </tr>
                          );
                        }
                        return filtered.map(emp => (
                          <tr key={emp.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                            <td style={{ ...tdStyle, fontWeight: '700' }}>{emp.name}</td>
                            <td style={tdStyle}>{emp.email}</td>
                            <td style={tdStyle}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                backgroundColor: 
                                  emp.role === 'Manager' ? 'rgba(239, 68, 68, 0.15)' : 
                                  emp.role === 'Chef' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                                color: 
                                  emp.role === 'Manager' ? '#ef4444' : 
                                  emp.role === 'Chef' ? '#ea580c' : '#2563eb'
                              }}>
                                {emp.role}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Shift Attendance Log Table */}
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'var(--card-shadow)',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border-color)', fontSize: '16px', fontWeight: '800', textAlign: 'left' }}>
                    Shift Attendance Logs
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={thStyle}>Staff Employee</th>
                        <th style={thStyle}>Clock In Time</th>
                        <th style={thStyle}>Clock Out Time</th>
                        <th style={thStyle}>Duty Status</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Shift Management</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceLogsList.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No attendance logs stored in history.
                          </td>
                        </tr>
                      ) : (
                        attendanceLogsList.slice(0, 10).map(log => (
                          <tr key={log.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                            <td style={{ ...tdStyle, fontWeight: '700' }}>
                              <div>{log.employeeName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{log.employeeEmail}</div>
                            </td>
                            <td style={tdStyle}>{new Date(log.loginTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td style={tdStyle}>
                              {log.logoutTime ? new Date(log.logoutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                            </td>
                            <td style={tdStyle}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: log.logoutTime ? 'rgba(255, 255, 255, 0.08)' : 'rgba(16, 185, 129, 0.15)',
                                color: log.logoutTime ? 'var(--text-secondary)' : '#10b981'
                              }}>
                                {log.logoutTime ? 'Completed' : 'On Duty'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <button
                                onClick={() => handleToggleShift(log.id)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1.5px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-button)',
                                  color: 'var(--text-primary)',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                {log.logoutTime ? 'Reopen Shift' : 'End Duty Shift'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'reports' ? (
          <div style={bodyOrdersStyle}>
            {/* POS Analytics & Reports page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Business Reports & Dashboard</h2>
              <button 
                onClick={reloadManagementData}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--border-focus)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Sync Data Log
              </button>
            </div>

            {(() => {
              // Calculate statistics
              const totalRevenue = ordersList.reduce((acc, o) => acc + o.amount, 0);
              const totalOrdersCount = ordersList.length;
              const aov = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : 0;
              const unpaidRevenue = ordersList
                .filter(o => o.status === 'Unpaid')
                .reduce((acc, o) => acc + o.amount, 0);

              // Calculate payment method percentage statistics
              const paymentCounts = ordersList.reduce((acc, o) => {
                const method = o.paymentMethod || '-';
                acc[method] = (acc[method] || 0) + o.amount;
                return acc;
              }, {});

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Top Stats Cards row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    
                    {/* Revenue Card */}
                    <div style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)',
                      color: '#ffffff',
                      boxShadow: 'var(--card-shadow)',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Gross Revenue</div>
                      <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>₹{totalRevenue}</div>
                      <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Aggregate sales values logged</div>
                    </div>

                    {/* Orders Card */}
                    <div style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      boxShadow: 'var(--card-shadow)',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Orders Handled</div>
                      <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>{totalOrdersCount}</div>
                      <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Total transactional orders registered</div>
                    </div>

                    {/* Average Ticket Value (AOV) Card */}
                    <div style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                      color: '#ffffff',
                      boxShadow: 'var(--card-shadow)',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Average Ticket</div>
                      <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>₹{aov}</div>
                      <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Average billing price per cart</div>
                    </div>

                    {/* Unpaid Outstanding Card */}
                    <div style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
                      color: '#ffffff',
                      boxShadow: 'var(--card-shadow)',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Outstanding Unpaid</div>
                      <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>₹{unpaidRevenue}</div>
                      <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Receivables pending settlement</div>
                    </div>

                  </div>

                  {/* Payment Distribution and Session Logs Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                    
                    {/* Payment Distribution Card */}
                    <div style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: 'var(--card-shadow)',
                      color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
                        Sales Volume by Payment Option
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {Object.entries(paymentCounts).map(([method, amount]) => {
                          const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0;
                          return (
                            <div key={method} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700' }}>
                                <span>{method === '-' ? 'Unpaid Settlement' : method}</span>
                                <span>₹{amount} ({percentage}%)</span>
                              </div>
                              <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  backgroundColor: 
                                    method === 'UPI' ? '#0d9488' : 
                                    method === 'Cash' ? '#ea580c' : 
                                    method === 'Card' ? '#7c3aed' : '#ef4444',
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(paymentCounts).length === 0 && (
                          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                            No sales records computed yet.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Session Logs Card */}
                    <div style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: 'var(--card-shadow)',
                      color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
                        Active POS Operations Logs
                      </h3>
                      <div style={{
                        maxHeight: '260px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        {logs.slice(0, 10).map((log) => (
                          <div key={log.id} style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-primary)',
                            borderLeft: `4px solid ${
                              log.type === 'success' ? '#10b981' : 
                              log.type === 'warning' ? '#ea580c' : 
                              log.type === 'danger' ? '#ef4444' : 'var(--text-secondary)'
                            }`,
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{log.message}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>{log.time}</span>
                          </div>
                        ))}
                        {logs.length === 0 && (
                          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                            No session activity logs registered.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}

          </div>
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
                onClick={() => setActiveRightTab('checkout')}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeRightTab === 'checkout' ? '2.5px solid var(--border-focus)' : '2.5px solid transparent',
                  color: activeRightTab === 'checkout' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  transition: 'all 0.2s'
                }}
              >
                Checkout
              </button>
              <button 
                onClick={() => setActiveRightTab('logs')}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeRightTab === 'logs' ? '2.5px solid var(--border-focus)' : '2.5px solid transparent',
                  color: activeRightTab === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  transition: 'all 0.2s'
                }}
              >
                Session Logs
              </button>
            </div>

            {activeRightTab === 'checkout' ? (
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
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                height: '100%',
                maxHeight: '440px',
                overflowY: 'auto',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                padding: '12px',
                border: '1.5px solid var(--border-color)',
                textAlign: 'left',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-secondary)' }}>Log Feed</span>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('pos_session_logs');
                      setLogs([]);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Clear Logs
                  </button>
                </div>
                {logs.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                    No logs recorded in this session.
                  </div>
                ) : (
                  logs.map((log) => {
                    let typeColor = 'var(--text-secondary)';
                    if (log.type === 'success') typeColor = '#10b981';
                    if (log.type === 'warning') typeColor = '#f97316';
                    if (log.type === 'danger') typeColor = '#ef4444';

                    return (
                      <div key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', lineHeight: '1.4' }}>
                        <span style={{ color: 'var(--text-link)', marginRight: '6px' }}>[{log.time}]</span>
                        <span style={{ color: typeColor }}>{log.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
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
                {(couponList || []).filter(c => c.type === 'Coupon' && c.activated).map(coupon => (
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
              <button 
                onClick={() => setIsTableModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                &times;
              </button>
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
                  setActiveTable('Takeaway');
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

            {/* Tables Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              padding: '10px 0'
            }}>
              {(() => {
                const storedTables = localStorage.getItem('floor_plan_tables');
                let currentTables = [];
                if (storedTables) {
                  currentTables = JSON.parse(storedTables);
                } else {
                  // Generate default tables list F1-F10 and S1-S10
                  for (let i = 1; i <= 10; i++) {
                    currentTables.push({ id: `f${i}`, name: `f${i}`, floor: 1, status: 'free' });
                    currentTables.push({ id: `s${i}`, name: `s${i}`, floor: 2, status: 'free' });
                  }
                }
                const floorTables = currentTables.filter(t => t.floor === activeFloor);

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
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTable(t.name);
                        addLogEntry(`Selected Table: ${t.name} (Floor ${activeFloor})`, 'info');
                        setIsTableModalOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 10px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid var(--border-focus)' : '1.5px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--bg-button)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--border-focus)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = isSelected ? 'var(--border-focus)' : 'var(--border-color)';
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Table {t.name.toUpperCase()}
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

import React, { useState } from 'react';
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
  DollarSign, 
  UserPlus, 
  Percent 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const POS = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Categories & Products Data
  const categories = ['Beverages', 'Chaat', 'Desert', 'Meal'];
  
  const productsData = {
    Beverages: [
      { id: 'b1', name: 'Masala Tea', price: 40, inStock: true },
      { id: 'b2', name: 'Coffee', price: 60, inStock: true },
      { id: 'b3', name: 'Lassi', price: 50, inStock: true },
      { id: 'b4', name: 'Espresso', price: 70, inStock: true },
      { id: 'b5', name: 'Cold Brew', price: 90, inStock: false },
    ],
    Chaat: [
      { id: 'c1', name: 'Samosa Chaat', price: 120, inStock: true },
      { id: 'c2', name: 'Papdi Chaat', price: 110, inStock: true },
      { id: 'c3', name: 'Bhel Puri', price: 90, inStock: true },
    ],
    Desert: [
      { id: 'd1', name: 'Chocolate Brownie', price: 180, inStock: true },
      { id: 'd2', name: 'Ice Cream Cup', price: 100, inStock: true },
      { id: 'd3', name: 'Gulab Jamun', price: 80, inStock: false },
    ],
    Meal: [
      { id: 'm1', name: 'Cheese Burger', price: 150, inStock: true },
      { id: 'm2', name: 'Veg Sandwich', price: 120, inStock: true },
      { id: 'm3', name: 'Paneer Wrap', price: 160, inStock: true },
    ],
  };

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('Beverages');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([
    { id: 'm1', name: 'Cheese Burger', price: 150, quantity: 2 }
  ]);
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState('300');
  const [activeTable, setActiveTable] = useState('Table 12');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  };

  const updateQuantity = (id, delta) => {
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

  // Calculations
  const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subTotal * 0.05); // 5% GST
  const total = subTotal + tax;

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

  // Submit order to Kitchen
  const sendToKitchen = () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    alert(`Order sent to Kitchen successfully for ${activeTable}!\nTotal Amount: ₹${total}`);
    setCart([]);
    setPaidAmount('0');
  };

  // Search filter
  const filteredProducts = productsData[selectedCategory].filter((p) =>
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
    backgroundColor: '#110f0d',
    color: '#ffffff',
    fontFamily: 'var(--font-standard)',
    overflow: 'hidden',
  };

  const mainAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const headerStyle = {
    height: '70px',
    backgroundColor: '#1c1714',
    borderBottom: '1px solid #2d2621',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    gap: '20px',
  };

  const headerButtonsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconBtnStyle = {
    backgroundColor: '#2b211a',
    border: 'none',
    color: '#ffffff',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const tableSelectStyle = {
    backgroundColor: '#2b211a',
    border: 'none',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    outline: 'none',
    cursor: 'pointer',
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
    backgroundColor: '#181411',
    borderRight: '1px solid #2d2621',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px 8px',
    overflowY: 'auto',
  };

  const catBtnStyle = (isActive) => ({
    backgroundColor: isActive ? '#bfae9e' : 'transparent',
    color: isActive ? '#110f0d' : '#a0958a',
    border: 'none',
    padding: '14px 10px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
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
    backgroundColor: '#211c18',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '130px',
    cursor: inStock ? 'pointer' : 'not-allowed',
    border: '1.5px solid transparent',
    transition: 'all 0.2s ease',
    opacity: inStock ? 1 : 0.5,
    position: 'relative',
    textAlign: 'left',
  });

  const cartPanelStyle = {
    backgroundColor: '#181411',
    borderLeft: '1px solid #2d2621',
    borderRight: '1px solid #2d2621',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
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
    backgroundColor: '#211c18',
    padding: '14px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  };

  const paymentPanelStyle = {
    backgroundColor: '#1c1714',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  };

  const payMethodBtnStyle = (isActive) => ({
    flex: 1,
    backgroundColor: isActive ? '#bfae9e' : '#2b211a',
    color: isActive ? '#110f0d' : '#a0958a',
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
    transition: 'all 0.2s',
  });

  const numpadButtonStyle = {
    backgroundColor: '#2b211a',
    border: 'none',
    color: '#ffffff',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '52px',
    transition: 'background-color 0.2s',
  };

  // Slide-out hamburger navigation menu styling
  const slideSidebarStyle = {
    position: 'fixed',
    top: 0,
    right: isSidebarOpen ? 0 : '-300px',
    width: '280px',
    height: '100vh',
    backgroundColor: '#1a1512',
    borderLeft: '1px solid #28211b',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 20px',
    transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  const menuLinkStyle = {
    display: 'block',
    width: '100%',
    padding: '14px 16px',
    color: '#a0958a',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={pageStyle}>
      {/* Slide out hamburger Sidebar */}
      <div style={slideSidebarStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>POS Menu</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {user?.role === 'admin' && (
            <>
              <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/products')}>Products</button>
              <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/categories')}>Category</button>
              <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/payment-methods')}>Payment method</button>
              <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/coupons')}>Coupon & Promotion</button>
              <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/table-booking')}>Booking</button>
              <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/employees')}>User/Employee</button>
            </>
          )}
          <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/kds')}>KDS</button>
          {user?.role === 'admin' && (
            <button style={menuLinkStyle} onClick={() => handleSidebarNavigation('/reports')}>Reports</button>
          )}
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
            <div style={{
              backgroundColor: 'var(--bg-button)',
              color: '#110f0d',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '18px',
              letterSpacing: '0.5px'
            }}>
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
                  backgroundColor: '#2b211a',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 14px 10px 40px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
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
            
            <button style={iconBtnStyle} onClick={() => alert('Added custom customer order note.')}>
              <Layers size={18} />
            </button>
            
            {/* User badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#bfae9e',
              color: '#110f0d',
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

        {/* Main Grid */}
        <div style={bodyGridStyle}>
          
          {/* Categories Sidebar */}
          <div style={categorySidebarStyle}>
            {categories.map((cat) => (
              <button
                key={cat}
                style={catBtnStyle(selectedCategory === cat)}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
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
                
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', wordBreak: 'break-word' }}>
                  {p.name}
                </span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--bg-button)' }}>
                  ₹{p.price}
                </span>
              </button>
            ))}
          </div>

          {/* Shopping Cart List */}
          <div style={cartPanelStyle}>
            <div style={cartListStyle}>
              {cart.map((item) => (
                <div key={item.id} style={cartItemStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{item.name}</span>
                    <span style={{ fontSize: '12px', color: '#8a7e72' }}>₹{item.price} each</span>
                  </div>
                  
                  {/* Quantity adjustment controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        backgroundColor: '#2b211a',
                        border: 'none',
                        color: '#ffffff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '700',
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', width: '16px' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        backgroundColor: '#2b211a',
                        border: 'none',
                        color: '#ffffff',
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
                  
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginLeft: '8px', minWidth: '40px', textAlign: 'right' }}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations & Send to Kitchen */}
            <div style={{
              backgroundColor: '#1c1714',
              borderTop: '1px solid #2d2621',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {/* Send to Kitchen button */}
              <button
                onClick={sendToKitchen}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-button)',
                  color: '#110f0d',
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
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
              >
                <Send size={16} />
                Send to Kitchen
              </button>

              {/* Utility buttons row */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => alert('Customer linked to bill.')}
                  style={{ flex: 1, backgroundColor: '#2b211a', border: 'none', color: '#a0958a', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Customer
                </button>
                <button 
                  onClick={() => alert('Discount applied.')}
                  style={{ flex: 1, backgroundColor: '#2b211a', border: 'none', color: '#a0958a', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Discount
                </button>
                <button 
                  onClick={() => alert('Order printed.')}
                  style={{ flex: 1, backgroundColor: '#2b211a', border: 'none', color: '#a0958a', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Send
                </button>
              </div>

              {/* Calculation math rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', borderTop: '1px solid #2d2621', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a0958a' }}>
                  <span>Sub total</span>
                  <span>₹{subTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a0958a' }}>
                  <span>Tax(GST 5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', color: '#ffffff', marginTop: '4px' }}>
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Panel */}
          <div style={paymentPanelStyle}>
            {/* Quick Payment Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={payMethodBtnStyle(selectedPayment === 'Cash')}
                  onClick={() => setSelectedPayment('Cash')}
                >
                  <DollarSign size={16} />
                  Cash
                </button>
                <button
                  style={payMethodBtnStyle(selectedPayment === 'UPI')}
                  onClick={() => setSelectedPayment('UPI')}
                >
                  <UserPlus size={16} />
                  UPI
                </button>
              </div>
              <button
                style={{ ...payMethodBtnStyle(selectedPayment === 'Card'), flex: 'none', width: '100%' }}
                onClick={() => setSelectedPayment('Card')}
              >
                <Percent size={16} />
                Card
              </button>
            </div>

            {/* Paid Amount indicator */}
            <div style={{ margin: '14px 0', textAlign: 'left' }}>
              <span style={{ fontSize: '13px', color: '#8a7e72', fontWeight: '700' }}>Amount</span>
              <div style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#ffffff',
                borderBottom: '2px solid #2d2621',
                paddingBottom: '8px',
                marginTop: '6px'
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#382c23'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2b211a'}
                >
                  {num}
                </button>
              ))}
              
              <button
                style={numpadButtonStyle}
                onClick={() => handleNumpadClick('0')}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#382c23'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2b211a'}
              >
                0
              </button>

              <button
                style={numpadButtonStyle}
                onClick={() => handleNumpadClick('+/-')}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#382c23'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2b211a'}
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
                style={{ backgroundColor: '#2b211a', border: 'none', color: '#ffffff', padding: '12px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Prices
              </button>
              <button 
                onClick={() => alert(`Applied numerical discount.`)}
                style={{ backgroundColor: '#2b211a', border: 'none', color: '#ffffff', padding: '12px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Disc.
              </button>
              <button 
                onClick={() => alert(`Quantity multiplier ready.`)}
                style={{ backgroundColor: '#2b211a', border: 'none', color: '#ffffff', padding: '12px 6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Qty
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default POS;

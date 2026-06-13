import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, DollarSign, Grid3X3, Users, Plus, CalendarClock, Ticket } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import { getOrders } from '../../utils/db';

const Dashboard = () => {
  const { registerEmployee } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    ordersCount: 24,
    revenue: 24500,
    activeTables: 8
  });

  useEffect(() => {
    const list = getOrders();
    const totalOrders = list.length;
    const totalRev = list
      .filter(o => o.status === 'Paid')
      .reduce((sum, o) => sum + o.amount, 0);
    const activeTbls = new Set(list.filter(o => o.status === 'Unpaid').map(o => o.table)).size;

    setStats({
      ordersCount: totalOrders,
      revenue: totalRev,
      activeTables: activeTbls
    });
  }, []);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeRole, setEmployeeRole] = useState('chef');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    alert(`Product Added: ${productName} - $${productPrice}`);
    setProductName('');
    setProductPrice('');
    setIsProductModalOpen(false);
  };

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    const result = registerEmployee(employeeName, employeeEmail, employeePassword, employeeRole);
    if (result.success) {
      alert(`Employee registered!\nEmail: ${employeeEmail}\nPassword: ${employeePassword}\nRole: ${employeeRole}`);
      setEmployeeName('');
      setEmployeeEmail('');
      setEmployeePassword('');
      setEmployeeRole('chef');
      setIsEmployeeModalOpen(false);
    } else {
      alert(result.error);
    }
  };

  const handleCreateCouponSubmit = (e) => {
    e.preventDefault();
    alert(`Coupon Created: ${couponCode} with ${couponDiscount}% discount`);
    setCouponCode('');
    setCouponDiscount('');
    setIsCouponModalOpen(false);
  };

  // Mock activities list
  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'Order #OR-8239 placed by Table 4',
      time: '3 mins ago',
      meta: '₹1,450',
      icon: ShoppingCart,
      iconColor: '#f97316',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment processed successfully via UPI',
      time: '12 mins ago',
      meta: '+₹3,420',
      icon: DollarSign,
      iconColor: '#10b981',
    },
    {
      id: 3,
      type: 'booking',
      title: 'Table 6 reserved for Jane Smith',
      time: '25 mins ago',
      meta: '4 Guests',
      icon: CalendarClock,
      iconColor: '#3b82f6',
    },
    {
      id: 4,
      type: 'coupon',
      title: 'Coupon code "WELCOME10" redeemed',
      time: '45 mins ago',
      meta: '-₹150',
      icon: Ticket,
      iconColor: '#ef4444',
    },
    {
      id: 5,
      type: 'employee',
      title: 'Waiter Mark checked in for shift',
      time: '1 hour ago',
      meta: '11:00 AM',
      icon: Users,
      iconColor: '#a855f7',
    },
  ];

  // Inline layout styles
  const dashboardContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-standard)',
    transition: 'background-color var(--transition-speed), color var(--transition-speed)',
  };

  const contentAreaStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const mainContentStyle = {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
    overflowY: 'auto',
  };

  const welcomeSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const welcomeTitleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  };

  const welcomeSubStyle = {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    margin: 0,
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '20px',
  };

  const overviewGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    width: '100%',
  };

  const cardStyle = {
    flex: '1 1 200px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '18px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'background-color var(--transition-speed)',
  };

  const iconContainerStyle = (bgColor) => ({
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
  });

  const cardLabelStyle = {
    fontSize: '20px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  };

  const cardValueStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  };

  const quickActionsGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    width: '100%',
  };

  const quickActionCardStyle = {
    flex: '1 1 280px',
    backgroundColor: 'var(--border-focus)',
    borderRadius: '20px',
    padding: '36px 24px',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    cursor: 'pointer',
    color: 'var(--bg-primary)',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
  };

  const plusContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--bg-primary)',
  };

  const actionTextStyle = {
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '0.2px',
  };

  return (
    <div style={dashboardContainerStyle}>
      <Sidebar />
      <div style={contentAreaStyle}>
        <Header title="Dashboard" />
        
        <main style={mainContentStyle}>
          {/* Dashboard Welcome Header */}
          <div style={welcomeSectionStyle}>
            <h1 style={welcomeTitleStyle}>Dashboard</h1>
            <p style={welcomeSubStyle}>Welcome back! Here's what's happening in your restaurant today.</p>
          </div>

          {/* Today's Overview Section */}
          <div>
            <h2 style={sectionTitleStyle}>Today's Overview</h2>
            <div style={overviewGridStyle}>
              {/* Card 1: Today's Orders */}
              <div style={cardStyle}>
                <div style={iconContainerStyle('#f97316')}>
                  <ShoppingCart size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={cardLabelStyle}>Today's Orders</span>
                  <span style={cardValueStyle}>{stats.ordersCount}</span>
                </div>
              </div>

              {/* Card 2: Today's Revenue */}
              <div style={cardStyle}>
                <div style={iconContainerStyle('#10b981')}>
                  <DollarSign size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={cardLabelStyle}>Today's Revenue</span>
                  <span style={cardValueStyle}>₹{stats.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Card 3: Active Tables */}
              <div style={cardStyle}>
                <div style={iconContainerStyle('#3b82f6')}>
                  <Grid3X3 size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={cardLabelStyle}>Active Tables</span>
                  <span style={cardValueStyle}>{stats.activeTables}</span>
                </div>
              </div>

              {/* Card 4: Vacant Tables */}
              <div style={cardStyle}>
                <div style={iconContainerStyle('#475569')}>
                  <Grid3X3 size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={cardLabelStyle}>Vacant Tables</span>
                  <span style={cardValueStyle}>{Math.max(0, 12 - stats.activeTables)}</span>
                </div>
              </div>

              {/* Card 5: Employees on Shift */}
              <div style={cardStyle}>
                <div style={iconContainerStyle('#a855f7')}>
                  <Users size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={cardLabelStyle}>Employees on Shift</span>
                  <span style={cardValueStyle}>12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div>
            <h2 style={sectionTitleStyle}>Quick Actions</h2>
            <div style={quickActionsGridStyle}>
              {/* Quick Action 1: Add Product */}
              <button
                style={quickActionCardStyle}
                onClick={() => navigate('/products?add=true')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b09677';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#bda384';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={plusContainerStyle}>
                  <Plus size={24} />
                </div>
                <span style={actionTextStyle}>Add Product</span>
              </button>

              {/* Quick Action 2: Add Employees */}
              <button
                style={quickActionCardStyle}
                onClick={() => setIsEmployeeModalOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b09677';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#bda384';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={plusContainerStyle}>
                  <Plus size={24} />
                </div>
                <span style={actionTextStyle}>Add Employees</span>
              </button>

              {/* Quick Action 3: Create Coupon */}
              <button
                style={quickActionCardStyle}
                onClick={() => setIsCouponModalOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b09677';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#bda384';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={plusContainerStyle}>
                  <Plus size={24} />
                </div>
                <span style={actionTextStyle}>Create Coupon</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <h2 style={sectionTitleStyle}>Recent Activity</h2>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px 30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transition: 'background-color var(--transition-speed)',
            }}>
              {recentActivities.map((act, idx) => (
                <div 
                  key={act.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingBottom: idx !== recentActivities.length - 1 ? '16px' : '0',
                    borderBottom: idx !== recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: act.iconColor,
                    }}>
                      <act.icon size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {act.title}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {act.time}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: act.type === 'payment' ? '#10b981' : act.type === 'coupon' ? '#ef4444' : 'var(--text-secondary)',
                  }}>
                    {act.meta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Add New Product"
      >
        <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input
            label="Product Name"
            placeholder="e.g. Cold Brew Coffee"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 4.50"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Employee Name"
            placeholder="e.g. Jane Doe"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. jane@cafe.com"
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="e.g. securePass123"
            value={employeePassword}
            onChange={(e) => setEmployeePassword(e.target.value)}
            required
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: '700' }}>Role</label>
            <select
              value={employeeRole}
              onChange={(e) => setEmployeeRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-standard)',
                outline: 'none',
              }}
            >
              <option value="chef">Chef</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsEmployeeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title="Generate Coupon Code"
      >
        <form onSubmit={handleCreateCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input
            label="Coupon Code"
            placeholder="e.g. SUMMER25"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            required
          />
          <Input
            label="Discount Percentage (%)"
            type="number"
            min="1"
            max="100"
            placeholder="e.g. 25"
            value={couponDiscount}
            onChange={(e) => setCouponDiscount(e.target.value)}
            required
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsCouponModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;

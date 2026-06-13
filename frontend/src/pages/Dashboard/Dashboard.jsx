import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, DollarSign, Grid3X3, Users, Plus, ShoppingBag } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import { getOrders, getEmployeeLogs, getTables } from '../../utils/db';

const Dashboard = () => {
  const { registerEmployee } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    ordersCount: 0,
    revenue: 0,
    activeTables: 0,
    vacantTables: 0,
    employeesOnShift: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [viewAll, setViewAll] = useState(false);


  useEffect(() => {
    Promise.all([
      getOrders().catch(() => []),
      Promise.resolve(getEmployeeLogs()).catch(() => []),
      getTables().catch(() => [])
    ]).then(([orders, logs, tables]) => {
      if (!Array.isArray(orders)) orders = [];
      if (!Array.isArray(tables) || tables.length === 0) {
        const stored = localStorage.getItem('floor_plan_tables');
        tables = stored ? JSON.parse(stored) : [];
      }
      const totalOrders = orders.length;
      const totalRev = orders
        .filter(o => o.status === 'Paid')
        .reduce((sum, o) => sum + o.amount, 0);
      const activeTbls = new Set(orders.filter(o => o.status === 'Unpaid').map(o => o.table)).size;
      const totalTblsCount = tables.length || 12; // fallback to 12 if no tables in db
      const vacantTbls = Math.max(0, totalTblsCount - activeTbls);

      const activeLogs = Array.isArray(logs) ? logs.filter(l => l.logoutTime === null || l.logoutTime === undefined) : [];

      setStats({
        ordersCount: totalOrders,
        revenue: totalRev,
        activeTables: activeTbls,
        vacantTables: vacantTbls,
        employeesOnShift: activeLogs.length
      });

      // Filter activities to only include orders of "today" (that day) sorted newest first
      const today = new Date().toDateString();
      const todayOrders = orders
        .filter(o => o.dateTime && new Date(o.dateTime).toDateString() === today)
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

      const activities = todayOrders.map(o => ({
        id: o.id,
        iconColor: o.status === 'Paid' ? '#10b981' : '#f59e0b',
        icon: ShoppingBag,
        title: o.status === 'Paid' ? `Payment collected - ${o.table}` : `Order sent to kitchen - ${o.table}`,
        time: o.dateTime ? new Date(o.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        type: o.status === 'Paid' ? 'payment' : 'order',
        meta: o.status === 'Paid' ? `₹${o.amount}` : o.items ? `${o.items.split(',').length} items` : ''
      }));
      setRecentActivities(activities);
    }).catch(() => { });
  }, []);

  // Modal states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Form states
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeRole, setEmployeeRole] = useState('chef');

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    const result = await registerEmployee(employeeName, employeeEmail, employeePassword, employeeRole);
    if (result.success) {
      alert(`Employee registered successfully!\nEmail: ${employeeEmail}\nRole: ${employeeRole}`);
      setEmployeeName('');
      setEmployeeEmail('');
      setEmployeePassword('');
      setEmployeeRole('chef');
      setIsEmployeeModalOpen(false);
    } else {
      alert(result.error);
    }
  };

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
    fontSize: '20px',
    fontWeight: '1000',
    letterSpacing: '0.2px',
    color: 'var(--bg-primary)',
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
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={cardValueStyle}>{stats.activeTables}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      ({stats.vacantTables} Vacant)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Employees on Shift */}
              <div style={cardStyle}>
                <div style={iconContainerStyle('#a855f7')}>
                  <Users size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={cardLabelStyle}>Employees on Shift</span>
                  <span style={cardValueStyle}>{stats.employeesOnShift}</span>
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
                onClick={() => navigate('/coupons')}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Recent Activity</h2>
              {recentActivities.length > 5 && (
                <button
                  onClick={() => setViewAll(!viewAll)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--border-focus)',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {viewAll ? 'View Less' : 'View All'}
                </button>
              )}
            </div>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '24px 30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transition: 'background-color var(--transition-speed)',
            }}>
              {recentActivities.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', padding: '20px 0' }}>
                  No recent activity yet
                </div>
              ) : (
                (viewAll ? recentActivities : recentActivities.slice(0, 5)).map((act, idx, arr) => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: idx !== arr.length - 1 ? '16px' : '0',
                      borderBottom: idx !== arr.length - 1 ? '1px solid var(--border-color)' : 'none',
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
                      color: act.type === 'payment' ? '#10b981' : 'var(--text-secondary)',
                    }}>
                      {act.meta}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

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

    </div>
  );
};

export default Dashboard;

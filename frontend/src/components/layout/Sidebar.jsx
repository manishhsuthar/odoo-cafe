import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Grid3X3,
  DollarSign,
  Ticket,
  BarChart3,
  Zap,
  ChefHat,
  ClipboardList,
  CalendarClock,
  LogOut
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sidebarStyle = {
    width: '260px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    borderRight: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-speed), border-color var(--transition-speed), color var(--transition-speed)',
  };

  const headerStyle = {
    padding: '28px 24px',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    borderBottom: '1px solid var(--border-color)',
    transition: 'border-color var(--transition-speed)',
  };

  const navListStyle = {
    listStyle: 'none',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all var(--transition-speed) ease',
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'var(--bg-button)',
    color: 'var(--text-primary)',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Product Listing', path: '/products', icon: Package },
    { name: 'Order Tracking', path: '/orders', icon: ShoppingCart },
    { name: 'Employee Record', path: '/employees', icon: Users },
    { name: 'Tables & Floor Plans', path: '/tables', icon: Grid3X3 },
    { name: 'Payment Methods', path: '/payment-methods', icon: DollarSign },
    { name: 'Coupon Generation', path: '/coupons', icon: Ticket },
    { name: 'Revenue Reports', path: '/reports', icon: BarChart3 },
    { name: 'POS Sessions', path: '/pos-sessions', icon: Zap },
    { name: 'Customers', path: '/customers', icon: ChefHat },
    { name: 'Kitchen Inventory', path: '/kitchen-inventory', icon: ClipboardList },
  ];

  return (
    <aside style={sidebarStyle}>
      <div style={headerStyle}>Admin</div>
      <ul style={navListStyle}>
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            width: '100%',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#d9534f',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

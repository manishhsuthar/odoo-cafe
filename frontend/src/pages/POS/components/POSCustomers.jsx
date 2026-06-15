import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Mail, Phone, User, TrendingUp, Coins, X } from 'lucide-react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../../../utils/db';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spend-desc');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formName, setFormName] = useState('Mock Customer');
  const [formEmail, setFormEmail] = useState('mockcustomer@gmail.com');
  const [formPhone, setFormPhone] = useState('9876543210');
  const [formSpend, setFormSpend] = useState('0');
  const [formOrders, setFormOrders] = useState('0');
  const [errors, setErrors] = useState({});

  const fetchCustomers = () => {
    getCustomers()
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormName('Mock Customer');
    setFormEmail('mockcustomer@gmail.com');
    setFormPhone('9876543210');
    setFormSpend('0');
    setFormOrders('0');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone);
    setFormSpend(cust.spend.toString());
    setFormOrders(cust.ordersCount.toString());
    setErrors({});
    setIsModalOpen(true);
  };

  const handleFormNameChange = (val) => {
    if (val.length > 50) return;
    const filtered = val.replace(/[^a-zA-Z\s\.\-]/g, '');
    setFormName(filtered);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleFormPhoneChange = (val) => {
    const filtered = val.replace(/\D/g, '');
    if (filtered.length > 10) return;
    setFormPhone(filtered);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleFormEmailChange = (val) => {
    if (val.length > 100) return;
    setFormEmail(val);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleFormSpendChange = (val) => {
    const filtered = val.replace(/\D/g, '');
    setFormSpend(filtered);
    if (errors.spend) {
      setErrors(prev => ({ ...prev, spend: '' }));
    }
  };

  const handleFormOrdersChange = (val) => {
    const filtered = val.replace(/\D/g, '');
    setFormOrders(filtered);
    if (errors.orders) {
      setErrors(prev => ({ ...prev, orders: '' }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
      } catch (e) {
        alert('Failed to delete customer');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formName.trim()) {
      newErrors.name = 'Name is required';
    } else if (formName.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    } else if (/[^a-zA-Z\s\.\-]/.test(formName.trim())) {
      newErrors.name = 'Name can only contain letters, spaces, dots, or hyphens';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (formEmail.trim().length > 100) {
      newErrors.email = 'Email cannot exceed 100 characters';
    } else if (!emailRegex.test(formEmail.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formPhone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formPhone.length !== 10) {
      newErrors.phone = 'Phone number must contain exactly 10 digits';
    }

    const spendNum = parseFloat(formSpend);
    if (isNaN(spendNum) || spendNum < 0) {
      newErrors.spend = 'Total spend must be a non-negative number';
    }

    const ordersNum = parseInt(formOrders);
    if (isNaN(ordersNum) || ordersNum < 0) {
      newErrors.orders = 'Total orders must be a non-negative integer';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingCustomer) {
        const updated = await updateCustomer(editingCustomer.id, {
          name: formName, email: formEmail, phone: formPhone,
          spend: parseFloat(formSpend) || 0, orders_count: parseInt(formOrders) || 0
        });
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...updated } : c));
      } else {
        const created = await addCustomer({
          name: formName, email: formEmail, phone: formPhone,
          spend: parseFloat(formSpend) || 0, orders_count: parseInt(formOrders) || 0
        });
        setCustomers(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert('Failed to save customer');
    }
  };

  const totalCustomersCount = customers.length;
  const totalRevenueSpend = customers.reduce((sum, c) => sum + (parseFloat(c.spend) || 0), 0);
  const avgLifetimeValue = totalCustomersCount > 0 ? Math.round(totalRevenueSpend / totalCustomersCount) : 0;

  const filteredCustomers = customers
    .filter(c => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'spend-desc') return (parseFloat(b.spend) || 0) - (parseFloat(a.spend) || 0);
      if (sortBy === 'spend-asc') return (parseFloat(a.spend) || 0) - (parseFloat(b.spend) || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'orders-desc') return b.ordersCount - a.ordersCount;
      return 0;
    });

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div style={bodyOrdersStyle}>
      {/* Title & Add customer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Customers Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>View and manage customer directory databases.</p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--border-focus)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: 'var(--card-shadow)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* CRM Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-link)', marginBottom: '8px' }}>
            <User size={18} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Customers</span>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{totalCustomersCount}</h3>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '8px' }}>
            <TrendingUp size={18} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total CRM Spend</span>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>₹{totalRevenueSpend.toLocaleString()}</h3>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', marginBottom: '8px' }}>
            <Coins size={18} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Avg Customer Value</span>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>₹{avgLifetimeValue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '12px 18px', marginBottom: '20px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '8px 14px', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '14px', width: '100%', fontWeight: '600' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}
          >
            <option value="spend-desc">Spend: High to Low</option>
            <option value="spend-asc">Spend: Low to High</option>
            <option value="orders-desc">Orders: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '14.5px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total Spend</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Total Orders</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--bg-button)', border: '1.5px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: 'var(--text-link)' }}>
                        {getInitials(c.name)}
                      </div>
                      <span style={{ fontWeight: '700' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={13} color="var(--text-secondary)" />
                      <span>{c.email}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="var(--text-secondary)" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '800', color: 'var(--text-link)' }}>
                    ₹{(parseFloat(c.spend) || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: '700' }}>
                    {c.ordersCount}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(c)}
                        style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '440px',
            boxShadow: 'var(--card-shadow)',
            padding: '24px',
            position: 'relative',
            textAlign: 'left',
            boxSizing: 'border-box'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleFormNameChange(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                />
                {errors.name && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.name}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => handleFormEmailChange(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                />
                {errors.email && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.email}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => handleFormPhoneChange(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                />
                {errors.phone && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.phone}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 150px', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>Spend (₹)</label>
                  <input
                    type="number"
                    value={formSpend}
                    onChange={(e) => handleFormSpendChange(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 150px', minWidth: 0, boxSizing: 'border-box' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>Orders</label>
                  <input
                    type="number"
                    value={formOrders}
                    onChange={(e) => handleFormOrdersChange(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--border-focus)', color: 'var(--bg-primary)', fontWeight: '800', cursor: 'pointer' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSCustomers;

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { Search, Plus, Trash2, Edit, Mail, Phone, User, TrendingUp, Coins, Award, X } from 'lucide-react';

const DEFAULT_CUSTOMERS = [
  { id: 'cust_1', name: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', phone: '+91 98765 43210', spend: 12850, ordersCount: 6 },
  { id: 'cust_2', name: 'Priya Singh', email: 'priya.singh@yahoo.com', phone: '+91 87654 32109', spend: 10420, ordersCount: 5 },
  { id: 'cust_3', name: 'Amit Patel', email: 'amit.patel@outlook.com', phone: '+91 76543 21098', spend: 8180, ordersCount: 4 },
  { id: 'cust_4', name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '+91 99999 88888', spend: 7950, ordersCount: 4 },
  { id: 'cust_5', name: 'Vikram Shah', email: 'vikram.shah@gmail.com', phone: '+91 88888 77777', spend: 6840, ordersCount: 3 },
  { id: 'cust_6', name: 'Kunal Sharma', email: 'kunal.sharma@gmail.com', phone: '+91 77777 66666', spend: 1500, ordersCount: 1 }
];

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spend-desc');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSpend, setFormSpend] = useState('');
  const [formOrders, setFormOrders] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('customers');
    if (stored) {
      setCustomers(JSON.parse(stored));
    } else {
      setCustomers(DEFAULT_CUSTOMERS);
      localStorage.setItem('customers', JSON.stringify(DEFAULT_CUSTOMERS));
    }
  }, []);

  const saveToStorage = (updatedList) => {
    setCustomers(updatedList);
    localStorage.setItem('customers', JSON.stringify(updatedList));
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updated = customers.filter(c => c.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formName.trim()) newErrors.name = 'Name is required';
    if (!formEmail.trim() || !formEmail.includes('@')) newErrors.email = 'Valid email is required';
    if (!formPhone.trim()) newErrors.phone = 'Phone number is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const customerPayload = {
      id: editingCustomer ? editingCustomer.id : `cust_${Date.now()}`,
      name: formName,
      email: formEmail,
      phone: formPhone,
      spend: parseFloat(formSpend) || 0,
      ordersCount: parseInt(formOrders) || 0
    };

    let updatedList;
    if (editingCustomer) {
      updatedList = customers.map(c => c.id === editingCustomer.id ? customerPayload : c);
    } else {
      updatedList = [customerPayload, ...customers];
    }

    saveToStorage(updatedList);
    setIsModalOpen(false);
  };

  // Compute metrics
  const totalCustomersCount = customers.length;
  const totalRevenueSpend = customers.reduce((sum, c) => sum + c.spend, 0);
  const avgLifetimeValue = totalCustomersCount > 0 ? Math.round(totalRevenueSpend / totalCustomersCount) : 0;

  // Filter and sort customer list
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
      if (sortBy === 'spend-desc') return b.spend - a.spend;
      if (sortBy === 'spend-asc') return a.spend - b.spend;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'orders-desc') return b.ordersCount - a.ordersCount;
      return 0;
    });

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Customers Directory" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Customers Directory</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Manage customer profiles, contact info, total spends, and orders count.</p>
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

          {/* Customer CRM Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* Total Registered Customers */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(191, 174, 158, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-link)', marginBottom: '16px' }}>
                <User size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Customers</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {totalCustomersCount}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Active in restaurant directory</span>
            </div>

            {/* Total Customer Spend */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
                <TrendingUp size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total CRM Spend</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                ₹{totalRevenueSpend.toLocaleString()}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Accumulated lifetime sales</span>
            </div>

            {/* Average Lifetime Value */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '16px' }}>
                <Coins size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Avg Customer Value</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                ₹{avgLifetimeValue.toLocaleString()}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Average lifetime spend value</span>
            </div>

          </div>

          {/* Filters and Search toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-primary)', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', flex: 1, minWidth: '280px' }}>
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by name, email, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  width: '100%',
                  fontWeight: '600'
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <option value="spend-desc">Total Spend: High to Low</option>
                <option value="spend-asc">Total Spend: Low to High</option>
                <option value="orders-desc">Orders Count: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Customers Main Table Grid */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Customer</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Email (Mail)</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Phone (Number)</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'right' }}>Total Spend</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'center' }}>Total Orders</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                      No customers found in directory matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                      
                      {/* Name & Avatar bubble */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-button-hover)',
                            border: '1.5px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '800',
                            color: 'var(--text-link)'
                          }}>
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)' }}>{c.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} style={{ color: 'var(--text-link)' }} />
                          <span>{c.email}</span>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={14} style={{ color: 'var(--text-link)' }} />
                          <span>{c.phone}</span>
                        </div>
                      </td>

                      {/* Spend */}
                      <td style={{ padding: '16px 24px', fontSize: '14.5px', fontWeight: '800', color: 'var(--text-link)', textAlign: 'right' }}>
                        ₹{c.spend.toLocaleString()}
                      </td>

                      {/* Total Orders */}
                      <td style={{ padding: '16px 24px', fontSize: '14.5px', fontWeight: '750', color: 'var(--text-primary)', textAlign: 'center' }}>
                        {c.ordersCount}
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(c)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--text-link)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-color)',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                              e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* Add / Edit Customer Dialog Overlay Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: 'var(--card-shadow)',
            padding: '28px',
            position: 'relative',
            textAlign: 'left'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>

            <h3 className="handwritten" style={{ fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: errors.name ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
                {errors.name && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>{errors.name}</span>}
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Email (Mail)</label>
                <input
                  type="email"
                  placeholder="e.g. rajesh@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: errors.email ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
                {errors.email && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>{errors.email}</span>}
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Phone (Number)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: errors.phone ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
                {errors.phone && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>{errors.phone}</span>}
              </div>

              {/* Spend & Orders side by side */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formSpend}
                    onChange={(e) => setFormSpend(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Orders</label>
                  <input
                    type="number"
                    min="0"
                    value={formOrders}
                    onChange={(e) => setFormOrders(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--border-focus)',
                    color: 'var(--bg-primary)',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Save Customer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Table from '../../components/ui/Table';
import { Trash2, CheckCircle, Search, Filter, RefreshCw, X, CircleDollarSign } from 'lucide-react';
import { getOrders, saveOrders } from '../../utils/db';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  
  // Custom Payment Modal for completing unpaid orders
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setOrders(getOrders());
  };

  const handleStatusChange = (orderId, newStatus, payMethod = '-') => {
    const updated = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          paymentMethod: payMethod
        };
      }
      return order;
    });
    saveOrders(updated);
    setOrders(updated);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order record?')) {
      const updated = orders.filter(o => o.id !== orderId);
      saveOrders(updated);
      setOrders(updated);
    }
  };

  const handleMarkAsPaidClick = (order) => {
    setActivePaymentOrder(order);
  };

  const handleCompletePayment = (method) => {
    if (activePaymentOrder) {
      handleStatusChange(activePaymentOrder.id, 'Paid', method);
      setActivePaymentOrder(null);
      alert(`Order ${activePaymentOrder.id} marked as Paid via ${method}.`);
    }
  };

  // Format date string to readable Local time
  const formatDateTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  // Filter orders based on search query, status, and payment method
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items && order.items.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const headers = ['ID', 'Date & Time', 'Table', 'Items Description', 'Payment Method', 'Amount', 'Status', 'Actions'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Order Tracking" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Active Orders & Receipts</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Track sales checkout status, tables serving, and payments received.</p>
            </div>
            
            <button 
              onClick={loadOrders}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-button)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 14px', width: '300px', transition: 'border-color 0.2s' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input 
                type="text"
                placeholder="Search table, ID or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>

            {/* Quick Status and Payment Filter Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              
              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Status:</span>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', padding: '2px' }}>
                  {['All', 'Paid', 'Unpaid'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: statusFilter === status ? 'var(--border-focus)' : 'transparent',
                        color: statusFilter === status ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Paid By:</span>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', padding: '2px' }}>
                  {['All', 'Cash', 'UPI', 'Card', '-'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentFilter(method)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: paymentFilter === method ? 'var(--border-focus)' : 'transparent',
                        color: paymentFilter === method ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {method === '-' ? 'None' : method}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Table Container Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No matching orders found.
              </div>
            ) : (
              <Table
                headers={headers}
                data={filteredOrders}
                renderRow={(order) => (
                  <>
                    <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>{order.id}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-primary)' }}>{formatDateTime(order.dateTime)}</td>
                    <td style={{ padding: '16px 12px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{order.table}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.items}>
                      {order.items}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      {order.paymentMethod !== '-' ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: 
                            order.paymentMethod === 'Cash' ? 'rgba(13, 148, 136, 0.15)' :
                            order.paymentMethod === 'UPI' ? 'rgba(124, 58, 237, 0.15)' :
                            'rgba(37, 99, 235, 0.15)',
                          color:
                            order.paymentMethod === 'Cash' ? '#0d9488' :
                            order.paymentMethod === 'UPI' ? '#7c3aed' :
                            '#2563eb',
                        }}>
                          {order.paymentMethod}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>₹{order.amount}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: order.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                        color: order.status === 'Paid' ? '#10b981' : '#f97316'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: order.status === 'Paid' ? '#10b981' : '#f97316' }}></span>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {order.status === 'Unpaid' && (
                          <button 
                            onClick={() => handleMarkAsPaidClick(order)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#10b981',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Mark as Paid"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              />
            )}
          </div>
        </main>
      </div>

      {/* --- PAYMENT COLLECTION MODAL FOR UNPAID ORDERS --- */}
      {activePaymentOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <div style={{
            width: '400px',
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 className="handwritten" style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Process Payment</h3>
              <button 
                onClick={() => setActivePaymentOrder(null)}
                style={{ background: 'none', border: 'none', color: '#ff5c5c', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>

            {/* Body Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                <strong style={{ fontFamily: 'var(--mono)' }}>{activePaymentOrder.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Table Number:</span>
                <strong>{activePaymentOrder.table}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontWeight: '700' }}>Amount to Pay:</span>
                <strong style={{ color: 'var(--text-primary)' }}>₹{activePaymentOrder.amount}</strong>
              </div>
            </div>

            {/* Payment Options Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Select Payment Method:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Cash', 'UPI', 'Card'].map((method) => (
                  <button
                    key={method}
                    onClick={() => handleCompletePayment(method)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-button)',
                      color: 'var(--text-primary)',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)';
                      e.currentTarget.style.borderColor = 'var(--border-focus)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <CircleDollarSign size={18} />
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Cancel */}
            <button
              onClick={() => setActivePaymentOrder(null)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;

import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSPaymentMethodsManagement = ({
  allPaymentMethods,
  setAllPaymentMethods,
  addLogEntry
}) => {
  const [searchPaymentQuery, setSearchPaymentQuery] = useState('');
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentType, setNewPaymentType] = useState('Cash');
  const [newPaymentValue, setNewPaymentValue] = useState('');

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

  return (
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
  );
};

export default POSPaymentMethodsManagement;

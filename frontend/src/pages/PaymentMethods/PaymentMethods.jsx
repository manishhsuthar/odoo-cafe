import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { getPaymentMethods, savePaymentMethods } from '../../utils/db';

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    methodId: null,
    newChecked: false,
    displayName: ''
  });

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = () => {
    getPaymentMethods()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map(m => ({
          id: m.id || `pay_${Date.now()}_${Math.random()}`,
          type: m.type || m.name || 'UPI',
          value: m.value || '',
          activated: m.activated !== undefined ? m.activated : true
        }));
        setMethods(mapped);
      })
      .catch(() => setMethods([]));
  };

  const handleSave = async (updatedList) => {
    const listToSave = updatedList || methods;
    try {
      await savePaymentMethods(listToSave);
      setMethods([...listToSave]);
    } catch (e) {
      setMethods([...listToSave]);
    }
  };

  const handleAddRow = () => {
    const newMethod = {
      id: `pay_${Date.now()}`,
      type: 'UPI',
      value: 'mock_upi_id@bank',
      activated: true
    };
    const updated = [...methods, newMethod];
    handleSave(updated);
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Delete this payment method?')) {
      const updated = methods.filter(m => m.id !== id);
      handleSave(updated);
    }
  };

  const handleFieldChange = (id, field, val) => {
    const updated = methods.map(m => {
      if (m.id === id) {
        return { ...m, [field]: val };
      }
      return m;
    });
    handleSave(updated);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Payment Configuration" />

        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Header text */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Configure Payment Gateways</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Edit POS checkout payment categories, types, terminal credentials, and activation states.</p>
            </div>
          </div>

          {/* Action Tools: [+ New] button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={handleAddRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontFamily: 'var(--font-standard)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.22)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
            >
              <Plus size={14} />
              New
            </button>
          </div>

          {/* Table Container */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
                }}>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)' }}>Payment Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)' }}>Id</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)', textAlign: 'center' }}>Activate</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)', width: '80px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) => (
                  <tr
                    key={method.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    {/* Drag handle and Payment Type Select */}
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', cursor: 'grab' }}>
                          <GripVertical size={16} />
                        </span>

                        <select
                          value={["Cash", "Card", "UPI"].includes(method.type) ? method.type : "Custom"}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Custom") {
                              handleFieldChange(method.id, 'type', 'Custom Method');
                            } else {
                              handleFieldChange(method.id, 'type', val);
                            }
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '1.5px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-standard)',
                            fontSize: '15px',
                            fontWeight: '700',
                            padding: '6px 20px 6px 0',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="Cash" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Cash</option>
                          <option value="Card" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Card</option>
                          <option value="UPI" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>UPI</option>
                          <option value="Custom" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>Custom...</option>
                        </select>

                        {!["Cash", "Card", "UPI"].includes(method.type) && (
                          <input
                            type="text"
                            value={method.type === 'Custom Method' ? '' : method.type}
                            onChange={(e) => handleFieldChange(method.id, 'type', e.target.value || 'Custom Method')}
                            placeholder="Enter custom name"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--border-color)',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)',
                              fontFamily: 'var(--font-standard)',
                              fontSize: '14px',
                              fontWeight: '700',
                              outline: 'none',
                              width: '160px',
                              transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                          />
                        )}
                      </div>
                    </td>

                    {/* Id input */}
                    <td style={{ padding: '12px 20px' }}>
                      <input
                        type="text"
                        placeholder="Enter ID / Value (e.g. gateway_id)"
                        value={method.value}
                        onChange={(e) => handleFieldChange(method.id, 'value', e.target.value)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '1.5px solid transparent',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-standard)',
                          fontSize: '15px',
                          padding: '6px 0',
                          outline: 'none',
                          width: '240px'
                        }}
                        onFocus={(e) => e.target.style.borderBottom = '1.5px solid var(--border-focus)'}
                        onBlur={(e) => e.target.style.borderBottom = '1.5px solid transparent'}
                      />
                    </td>

                    {/* Activate Checkbox */}
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                        <input
                          type="checkbox"
                          checked={method.activated === true || method.activated === 'true'}
                          onChange={(e) => {
                            const newChecked = e.target.checked;
                            const displayName = method.type === 'Custom Method' ? 'Custom Method' : method.type;
                            setConfirmDialog({
                              isOpen: true,
                              methodId: method.id,
                              newChecked,
                              displayName
                            });
                          }}
                          style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            height: '18px',
                            width: '18px',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '4px',
                            backgroundColor: (method.activated === true || method.activated === 'true') ? 'var(--border-focus)' : 'transparent',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            outline: 'none',
                            transition: 'all 0.15s'
                          }}
                        />
                        {(method.activated === true || method.activated === 'true') && (
                          <span style={{ position: 'absolute', transform: 'translate(4.5px, 0.5px)', fontSize: '11px', color: 'var(--bg-primary)', pointerEvents: 'none', fontWeight: 'bold' }}>✓</span>
                        )}
                      </label>
                    </td>

                    {/* Delete action */}
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteRow(method.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmDialog.isOpen && (
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
            border: '2px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Confirm Action</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.5', margin: 0 }}>
              Are you sure you want to {confirmDialog.newChecked ? 'ACTIVATE' : 'DEACTIVATE'} the payment method "{confirmDialog.displayName}"?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setConfirmDialog({ isOpen: false, methodId: null, newChecked: false, displayName: '' })}
                style={{
                  backgroundColor: 'var(--bg-button)',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleFieldChange(confirmDialog.methodId, 'activated', confirmDialog.newChecked);
                  setConfirmDialog({ isOpen: false, methodId: null, newChecked: false, displayName: '' });
                }}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13.5px',
                  fontWeight: '750',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;

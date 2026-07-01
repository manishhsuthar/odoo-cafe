import React, { useState } from 'react';
import { Search, Trash2, Edit2, Save, X } from 'lucide-react';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';
import { addCoupon, updateCoupon, deleteCoupon } from '../../../utils/db';

const POSCouponsManagement = ({
  allCouponsList,
  setAllCouponsList,
  addLogEntry
}) => {
  const [searchCouponsQuery, setSearchCouponsQuery] = useState('');
  const [newCouponName, setNewCouponName] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscountType, setNewCouponDiscountType] = useState('Percentage');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponMinAmount, setNewCouponMinAmount] = useState('');

  const [editCouponId, setEditCouponId] = useState(null);
  const [editCouponData, setEditCouponData] = useState({ name: '', code: '', discountType: 'Percentage', value: '', minAmount: '' });

  const handleEditClick = (cp) => {
    setEditCouponId(cp.id);
    setEditCouponData({ name: cp.name, code: cp.code, discountType: cp.discountType, value: cp.value, minAmount: cp.minAmount });
  };

  const handleCancelEdit = () => {
    setEditCouponId(null);
  };

  const handleSaveEdit = async (cpId) => {
    if (!editCouponData.name || !editCouponData.code || !editCouponData.value) return;

    const discountTypeMapped = editCouponData.discountType === 'Percentage' ? 'percentage' : 'flat';
    const apiPayload = {
      name: editCouponData.name,
      type: 'Coupon',
      code: editCouponData.code.toUpperCase(),
      discount_type: discountTypeMapped,
      discount_value: parseFloat(editCouponData.value),
      min_order_amount: parseFloat(editCouponData.minAmount || 0),
      is_active: true
    };

    if (typeof cpId === 'number' || !isNaN(cpId)) {
      try {
        await updateCoupon(cpId, apiPayload);
      } catch (err) {
        console.error("Failed to update coupon on backend:", err);
      }
    }

    const updated = allCouponsList.map(cp => 
      cp.id === cpId ? { ...cp, name: editCouponData.name, code: editCouponData.code.toUpperCase(), discountType: editCouponData.discountType, value: parseFloat(editCouponData.value), minAmount: parseFloat(editCouponData.minAmount || 0) } : cp
    );
    localStorage.setItem('coupons_list', JSON.stringify(updated));
    setAllCouponsList(updated);
    addLogEntry(`Updated coupon: ${editCouponData.code.toUpperCase()}`, 'success');
    setEditCouponId(null);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponName || !newCouponCode || !newCouponValue) return;

    const apiPayload = {
      name: newCouponName,
      type: 'Coupon',
      code: newCouponCode.toUpperCase(),
      discount_type: newCouponDiscountType === 'Percentage' ? 'percentage' : 'flat',
      discount_value: parseFloat(newCouponValue),
      min_order_amount: parseFloat(newCouponMinAmount || 0),
      is_active: true
    };

    let savedObj = {
      id: `cp_${Date.now()}`,
      name: newCouponName,
      code: newCouponCode.toUpperCase(),
      value: parseFloat(newCouponValue),
      discountType: newCouponDiscountType,
      minAmount: parseFloat(newCouponMinAmount || 0),
      activated: true
    };

    try {
      const created = await addCoupon(apiPayload);
      if (created && created.id) {
        savedObj = {
          id: created.id,
          name: created.name || newCouponName,
          code: (created.code || newCouponCode).toUpperCase(),
          value: parseFloat(created.value || created.discountValue || newCouponValue),
          discountType: created.discountType || (created.discountType === 'percentage' ? 'Percentage' : 'Fixed') || newCouponDiscountType,
          minAmount: parseFloat(created.minAmount || created.minOrderAmount || newCouponMinAmount || 0),
          activated: created.activated !== undefined ? created.activated : true
        };
      }
    } catch (err) {
      console.error("Failed to save coupon to backend:", err);
    }

    const updated = [...allCouponsList, savedObj];
    localStorage.setItem('coupons_list', JSON.stringify(updated));
    setAllCouponsList(updated);
    setNewCouponName('');
    setNewCouponCode('');
    setNewCouponValue('');
    setNewCouponMinAmount('');
    addLogEntry(`Added coupon code: ${savedObj.code}`, 'success');
    alert('Coupon added successfully!');
  };

  const handleToggleCoupon = async (cpId) => {
    let nextActiveState = true;
    const updated = allCouponsList.map(cp => {
      if (cp.id === cpId) {
        nextActiveState = !cp.activated;
        addLogEntry(`Coupon ${cp.code} marked as ${nextActiveState ? 'Active' : 'Inactive'}`, 'info');
        return { ...cp, activated: nextActiveState };
      }
      return cp;
    });

    const target = allCouponsList.find(cp => cp.id === cpId);
    if (target && (typeof cpId === 'number' || !isNaN(cpId))) {
      try {
        const discountTypeMapped = target.discountType === 'Percentage' ? 'percentage' : 'flat';
        await updateCoupon(cpId, {
          name: target.name,
          type: target.type || 'Coupon',
          code: target.code,
          discount_type: discountTypeMapped,
          discount_value: target.value,
          min_order_amount: target.minAmount,
          is_active: nextActiveState
        });
      } catch (err) {
        console.error("Failed to toggle coupon status on backend:", err);
      }
    }

    localStorage.setItem('coupons_list', JSON.stringify(updated));
    setAllCouponsList(updated);
  };

  const handleDeleteCoupon = async (cpId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const cp = allCouponsList.find(c => c.id === cpId);
      if (cp && (typeof cpId === 'number' || !isNaN(cpId))) {
        try {
          await deleteCoupon(cpId);
        } catch (err) {
          console.error("Failed to delete coupon on backend:", err);
        }
      }
      const updated = allCouponsList.filter(c => c.id !== cpId);
      localStorage.setItem('coupons_list', JSON.stringify(updated));
      setAllCouponsList(updated);
      if (cp) addLogEntry(`Deleted coupon ${cp.code}`, 'danger');
    }
  };

  return (
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                  <tr key={cp.id} style={{ borderBottom: '1.5px solid var(--border-color)', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    {editCouponId === cp.id ? (
                      <>
                        <td style={tdStyle}>
                          <input type="text" value={editCouponData.name} onChange={(e) => setEditCouponData({ ...editCouponData, name: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                        </td>
                        <td style={tdStyle}>
                          <input type="text" value={editCouponData.code} onChange={(e) => setEditCouponData({ ...editCouponData, code: e.target.value })} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', textTransform: 'uppercase' }} />
                        </td>
                        <td style={tdStyle}>
                           <div style={{ display: 'flex', gap: '4px' }}>
                             <select value={editCouponData.discountType} onChange={(e) => setEditCouponData({ ...editCouponData, discountType: e.target.value })} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}>
                               <option value="Percentage">%</option>
                               <option value="Fixed">₹</option>
                             </select>
                             <input type="number" value={editCouponData.value} onChange={(e) => setEditCouponData({ ...editCouponData, value: e.target.value })} style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                           </div>
                        </td>
                        <td style={tdStyle}>
                           <input type="number" value={editCouponData.minAmount} onChange={(e) => setEditCouponData({ ...editCouponData, minAmount: e.target.value })} style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>{cp.name}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750', fontFamily: 'var(--mono)' }}>{cp.code}</td>
                        <td style={tdStyle}>{cp.discountType === 'Percentage' ? `${cp.value}%` : `₹${cp.value}`} Off</td>
                        <td style={tdStyle}>₹{cp.minAmount || '0'}</td>
                      </>
                    )}
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
                        {editCouponId === cp.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(cp.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Save">
                              <Save size={14} />
                            </button>
                            <button onClick={handleCancelEdit} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Cancel">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(cp)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} title="Edit Coupon">
                              <Edit2 size={14} />
                            </button>
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
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
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

export default POSCouponsManagement;

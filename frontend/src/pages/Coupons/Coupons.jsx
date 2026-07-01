import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { getCategories, getProducts, getCoupons, addCoupon, updateCoupon, deleteCoupon } from '../../utils/db';
import { Plus, Trash2, Search, Save, Tag, GripVertical } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // New/Edit Form State
  const [formName, setFormName] = useState('Mock Promo');
  const [formType, setFormType] = useState('Coupon');
  const [formCode, setFormCode] = useState('MOCK50');
  const [formDiscountType, setFormDiscountType] = useState('Percentage');
  const [formValue, setFormValue] = useState(50);
  const [formMinAmount, setFormMinAmount] = useState(200);
  const [formTargetType, setFormTargetType] = useState('All'); // 'All', 'Category', 'Product'
  const [formTargetValue, setFormTargetValue] = useState('');
  const [formActivated, setFormActivated] = useState(true);

  const location = useLocation();

  useEffect(() => {
    loadCoupons();
    (async () => {
      const cats = await getCategories();
      const prods = await getProducts();
      setCategories(cats.map(c => c.name));
      setProducts(prods.map(p => p.name));
    })();
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      handleOpenNewModal();
    }
  }, [location]);

  const loadCoupons = async () => {
    try {
      let data = await getCoupons().catch(() => []);
      if (!Array.isArray(data) || data.length === 0) {
        const stored = localStorage.getItem('coupons_list');
        if (stored) {
          data = JSON.parse(stored);
        } else {
          const defaultCoupons = [
            { id: 'c_1', name: 'Welcome Offer', type: 'Coupon', code: 'NEW20', discountType: 'Percentage', value: 20, minAmount: 100, targetType: 'All', targetValue: '', activated: true },
            { id: 'c_2', name: 'Festive Special', type: 'Coupon', code: 'FEST50', discountType: 'Fixed Amount', value: 50, minAmount: 500, targetType: 'All', targetValue: '', activated: true },
            { id: 'c_3', name: 'Weekend Bonanza', type: 'Automated Promo', code: '', discountType: 'Percentage', value: 10, minAmount: 250, targetType: 'All', targetValue: '', activated: true },
            { id: 'c_4', name: 'Foodie Discount', type: 'Coupon', code: 'FOOD15', discountType: 'Percentage', value: 15, minAmount: 150, targetType: 'Category', targetValue: 'Food', activated: true }
          ];
          localStorage.setItem('coupons_list', JSON.stringify(defaultCoupons));
          data = defaultCoupons;
        }
      }
      const mapped = data.map(c => {
        const isPercentage = 
          (c.discountType && c.discountType.toLowerCase() === 'percentage') ||
          (c.discount_type && c.discount_type.toLowerCase() === 'percentage');
        return {
          id: c.id,
          name: c.name || 'Promotion',
          type: c.type || (c.code ? 'Coupon' : 'Automated Promo'),
          code: c.code || '',
          discountType: isPercentage ? 'Percentage' : 'Fixed Amount',
          value: Number(c.value !== undefined ? c.value : (c.discountValue !== undefined ? c.discountValue : (c.discount_value !== undefined ? c.discount_value : 0))),
          minAmount: Number(c.minAmount !== undefined ? c.minAmount : (c.minOrderAmount !== undefined ? c.minOrderAmount : (c.min_order_amount !== undefined ? c.min_order_amount : 0))),
          targetType: (c.targetType || c.target_type || 'all').toLowerCase() === 'category' ? 'Category' : ((c.targetType || c.target_type || 'all').toLowerCase() === 'product' ? 'Product' : 'All'),
          targetValue: c.targetValue || c.target_value || '',
          activated: c.activated !== undefined ? c.activated : (c.isActive !== undefined ? c.isActive : (c.is_active !== undefined ? c.is_active : true))
        };
      });
      setCoupons(mapped);
    } catch {
      setCoupons([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon/promotion?')) {
      try {
        await deleteCoupon(id).catch(() => {});
        const updated = coupons.filter(c => c.id !== id);
        setCoupons(updated);
        localStorage.setItem('coupons_list', JSON.stringify(updated));
      } catch {
        alert('Failed to delete coupon');
      }
    }
  };

  const handleToggleActive = async (id, currentVal) => {
    try {
      const target = coupons.find(c => c.id === id);
      if (!target) return;
      const nextActiveState = !currentVal;
      
      const apiPayload = {
        name: target.name,
        type: target.type,
        code: target.code,
        discount_type: target.discountType === 'Percentage' ? 'percentage' : 'fixed',
        discount_value: target.value,
        min_order_amount: target.minAmount,
        target_type: target.targetType === 'All' ? 'all' : target.targetType.toLowerCase(),
        target_value: target.targetValue,
        is_active: nextActiveState
      };

      await updateCoupon(id, apiPayload).catch(() => {});
      const updated = coupons.map(c => c.id === id ? { ...c, activated: nextActiveState } : c);
      setCoupons(updated);
      localStorage.setItem('coupons_list', JSON.stringify(updated));
    } catch {}
  };

  const handleOpenNewModal = () => {
    setSelectedCoupon(null);
    setFormName('Mock Promo');
    setFormType('Coupon');
    setFormCode('MOCK50');
    setFormDiscountType('Percentage');
    setFormValue(50);
    setFormMinAmount(200);
    setFormTargetType('All');
    setFormTargetValue('');
    setFormActivated(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormName(coupon.name);
    setFormType(coupon.type);
    setFormCode(coupon.code || '');
    setFormDiscountType(coupon.discountType || 'Percentage');
    setFormValue(coupon.value || 0);
    setFormMinAmount(coupon.minAmount || 0);
    setFormTargetType(coupon.targetType || 'All');
    setFormTargetValue(coupon.targetValue || '');
    setFormActivated(coupon.activated);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Promotion name is required');
      return;
    }
    if (formType === 'Coupon' && !formCode.trim()) {
      alert('Coupon code is required for Coupon type (e.g. NEW20)');
      return;
    }

    const payload = {
      id: selectedCoupon ? selectedCoupon.id : `c_${Date.now()}`,
      name: formName.trim(),
      type: formType,
      code: formType === 'Coupon' ? formCode.trim().toUpperCase() : '',
      discountType: formDiscountType,
      value: Number(formValue),
      minAmount: Number(formMinAmount),
      targetType: formTargetType,
      targetValue: formTargetValue,
      activated: formActivated
    };

  const apiPayload = {
    name: payload.name,
    type: payload.type,
    code: payload.code,
    discount_type: payload.discountType === 'Percentage' ? 'percentage' : 'flat',
    discount_value: payload.value,
    min_order_amount: payload.minAmount,
    target_type: payload.targetType === 'All' ? 'all' : payload.targetType.toLowerCase(),
    target_value: payload.targetValue,
    is_active: payload.activated
    }; 
    try {
      let savedObj = payload;
      if (selectedCoupon) {
        try {
          const updated = await updateCoupon(selectedCoupon.id, apiPayload);
          savedObj = { ...payload, ...updated };
        } catch {
          // offline fallback
        }
        const updatedList = coupons.map(c => c.id === selectedCoupon.id ? savedObj : c);
        setCoupons(updatedList);
        localStorage.setItem('coupons_list', JSON.stringify(updatedList));
      } else {
        try {
          const created = await addCoupon(apiPayload);
          savedObj = { ...payload, ...created };
        } catch {
          // offline fallback
        }
        const updatedList = [...coupons, savedObj];
        setCoupons(updatedList);
        localStorage.setItem('coupons_list', JSON.stringify(updatedList));
      }
      setIsModalOpen(false);
    } catch {
      alert('Failed to save coupon');
    }
  };

  // Filter coupons based on search query
  const filteredCoupons = coupons.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Promotions & Coupons" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Block */}
          <div>
            <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Coupon & Discount Programms</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Create automatic cart discounts or code-based discounts (like NEW20) targeting specific categories, minimum totals, or products.</p>
          </div>

          {/* Action Tools: [+ New] and [Search bar] matches visual of user screenshot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <button
              onClick={handleOpenNewModal}
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

            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input
                type="text"
                placeholder="e.g: Summur Sale"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 38px 10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  width: '260px',
                  fontFamily: 'var(--font-standard)'
                }}
              />
              <Search size={15} style={{ position: 'absolute', right: '12px', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          {/* Table Container matches user screenshot visual structure */}
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
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)' }}>Promotions Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)' }}>Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)' }}>Active programm</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)', textAlign: 'center' }}>Activate</th>
                  <th style={{ padding: '16px 20px', fontSize: '15px', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-standard)', width: '100px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr 
                    key={coupon.id} 
                    style={{
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    {/* Drag handle and Promo Name */}
                    <td 
                      onClick={() => handleOpenEditModal(coupon)}
                      style={{ padding: '16px 20px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', cursor: 'grab' }}>
                          <GripVertical size={16} />
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '15px', fontWeight: '750', color: 'var(--text-primary)' }}>{coupon.name}</span>
                          {coupon.code && <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginTop: '2px' }}>Code: {coupon.code}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        backgroundColor: coupon.type === 'Coupon' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: coupon.type === 'Coupon' ? '#10b981' : '#3b82f6'
                      }}>
                        {coupon.type}
                      </span>
                    </td>

                    {/* Active Programm Summary info */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' }}>
                        <strong>{coupon.discountType === 'Percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                          {coupon.minAmount > 0 ? `Min purchase: ₹${coupon.minAmount}` : 'No min purchase'}
                          {coupon.targetType !== 'All' && ` • For ${coupon.targetValue}`}
                        </span>
                      </div>
                    </td>

                    {/* Toggle Activate Checkbox */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={coupon.activated}
                          onChange={() => handleToggleActive(coupon.id, coupon.activated)}
                          style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            height: '18px',
                            width: '18px',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '4px',
                            backgroundColor: coupon.activated ? 'var(--border-focus)' : 'transparent',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            outline: 'none',
                            transition: 'all 0.15s'
                          }}
                        />
                        {coupon.activated && (
                          <span style={{ position: 'absolute', transform: 'translate(4.5px, 0.5px)', fontSize: '11px', color: 'var(--bg-primary)', pointerEvents: 'none', fontWeight: 'bold' }}>✓</span>
                        )}
                      </label>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDelete(coupon.id)}
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
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      No promotions or coupons found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* --- ADD / EDIT COUPON OVERLAY MODAL --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <form 
            onSubmit={handleFormSubmit}
            style={{
              width: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} style={{ color: '#ef4444' }} />
                <h3 className="handwritten" style={{ margin: 0, fontSize: '22px', color: 'var(--text-primary)' }}>
                  {selectedCoupon ? 'Edit Promotion' : 'New Promotion / Coupon'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>

            {/* Promo Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Promotions Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Sale, Customer Loyalty"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'var(--font-standard)'
                }}
              />
            </div>

            {/* Type & Special Coupon Code Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Promo Type *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontFamily: 'var(--font-standard)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Coupon">Coupon (Code based)</option>
                  <option value="Automated Promo">Automated (Automatic discount)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {formType === 'Coupon' ? 'Coupon Code *' : 'Automatic Trigger Code'}
                </label>
                <input
                  type="text"
                  required={formType === 'Coupon'}
                  disabled={formType === 'Automated Promo'}
                  placeholder={formType === 'Coupon' ? 'e.g. NEW20' : 'N/A (Applied Auto)'}
                  value={formType === 'Coupon' ? formCode : ''}
                  onChange={(e) => setFormCode(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    opacity: formType === 'Automated Promo' ? 0.6 : 1,
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '750',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-standard)'
                  }}
                />
              </div>
            </div>

            {/* Discount Value Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Discount Type *</label>
                <select
                  value={formDiscountType}
                  onChange={(e) => setFormDiscountType(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontFamily: 'var(--font-standard)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed Amount">Fixed Amount (₹)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Discount Value ({formDiscountType === 'Percentage' ? '%' : '₹'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontFamily: 'var(--font-standard)'
                  }}
                />
              </div>
            </div>

            {/* Scope / Targets & Conditions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Apply To Product(s)</label>
                <select
                  value={formTargetType}
                  onChange={(e) => {
                    setFormTargetType(e.target.value);
                    setFormTargetValue('');
                  }}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontFamily: 'var(--font-standard)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All Products</option>
                  <option value="Category">Specific Category</option>
                  <option value="Product">Specific Product</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Target Value</label>
                {formTargetType === 'All' ? (
                  <input
                    type="text"
                    disabled
                    placeholder="All Store Products"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      opacity: 0.6,
                      fontSize: '14px',
                      fontFamily: 'var(--font-standard)'
                    }}
                  />
                ) : formTargetType === 'Category' ? (
                  <select
                    value={formTargetValue}
                    required
                    onChange={(e) => setFormTargetValue(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      fontFamily: 'var(--font-standard)'
                    }}
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={formTargetValue}
                    required
                    onChange={(e) => setFormTargetValue(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px',
                      fontFamily: 'var(--font-standard)'
                    }}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(prod => (
                      <option key={prod} value={prod}>{prod}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Minimum purchase amount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Minimum Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 200 (Applies if order total exceeds this)"
                value={formMinAmount}
                onChange={(e) => setFormMinAmount(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'var(--font-standard)'
                }}
              />
            </div>

            {/* Status activation checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={formActivated}
                  onChange={(e) => setFormActivated(e.target.checked)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    height: '18px',
                    width: '18px',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: formActivated ? 'var(--border-focus)' : 'transparent',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    transition: 'all 0.15s'
                  }}
                />
                {formActivated && (
                  <span style={{ position: 'absolute', transform: 'translate(4.5px, 0.5px)', fontSize: '11px', color: 'var(--bg-primary)', pointerEvents: 'none', fontWeight: 'bold' }}>✓</span>
                )}
              </label>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Set as active promotion</span>
            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: '1.5px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
              <button
                type="submit"
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Save size={16} />
                Save Offer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Coupons;

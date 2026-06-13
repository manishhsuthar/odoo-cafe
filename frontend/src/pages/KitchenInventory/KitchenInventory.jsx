import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { Search, Plus, Trash2, Edit2, AlertTriangle, CheckCircle, PlusCircle, MinusCircle, X } from 'lucide-react';
import { getKitchenInventory, saveKitchenInventory } from '../../utils/db';

const KitchenInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('Mock Ingredient');
  const [formCategory, setFormCategory] = useState('Vegetables');
  const [formQuantity, setFormQuantity] = useState('10');
  const [formThreshold, setFormThreshold] = useState('5');
  const [formUnit, setFormUnit] = useState('kg');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const data = getKitchenInventory();
    setInventory(Array.isArray(data) ? data : []);
  }, []);

  const saveToStorage = (updatedList) => {
    setInventory(updatedList);
    saveKitchenInventory(updatedList);
  };

  const handleAdjustQuantity = (id, change) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, parseFloat((item.quantity + change).toFixed(2)));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveToStorage(updated);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('Mock Ingredient');
    setFormCategory('Vegetables');
    setFormQuantity('10');
    setFormThreshold('5');
    setFormUnit('kg');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity.toString());
    setFormThreshold(item.minThreshold.toString());
    setFormUnit(item.unit);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this ingredient?')) {
      const updated = inventory.filter(item => item.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formName.trim()) newErrors.name = 'Item name is required';
    if (parseFloat(formQuantity) < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (parseFloat(formThreshold) < 0) newErrors.threshold = 'Threshold cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      id: editingItem ? editingItem.id : `inv_${Date.now()}`,
      name: formName,
      category: formCategory,
      quantity: parseFloat(formQuantity) || 0,
      minThreshold: parseFloat(formThreshold) || 0,
      unit: formUnit
    };

    let updatedList;
    if (editingItem) {
      updatedList = inventory.map(item => item.id === editingItem.id ? payload : item);
    } else {
      updatedList = [payload, ...inventory];
    }

    saveToStorage(updatedList);
    setIsModalOpen(false);
  };

  // Metrics
  const totalItemsCount = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);
  const lowStockCount = lowStockItems.length;
  const availableCount = totalItemsCount - lowStockCount;

  // Filter list
  const filteredInventory = inventory.filter(item => {
    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    // Stock Status filter
    const isLow = item.quantity <= item.minThreshold;
    if (selectedStockStatus === 'Low' && !isLow) return false;
    if (selectedStockStatus === 'Available' && isLow) return false;

    // Search query filter
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Kitchen Inventory" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Kitchen Inventory</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Monitor stock levels of vegetables and kitchen ingredients. Adjust counts and manage safety thresholds.</p>
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
              <span>Add Ingredient</span>
            </button>
          </div>

          {/* Low Stock Warning Banner if any exists */}
          {lowStockCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px dashed #ef4444',
              borderRadius: '16px',
              padding: '16px 24px',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                <AlertTriangle style={{ color: '#ef4444' }} size={24} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Low Stock Alert!</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    There are <strong>{lowStockCount}</strong> vegetables or ingredients running below the set safety limits. Please replenish.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStockStatus('Low')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                View Low Stock
              </button>
            </div>
          )}

          {/* CRM Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* Total Items */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(191, 174, 158, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-link)', marginBottom: '16px' }}>
                <Search size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Ingredients</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {totalItemsCount}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Registered kitchen supplies</span>
            </div>

            {/* Available stock items */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
                <CheckCircle size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Available Stock</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {availableCount}
              </h3>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Safe levels</span>
            </div>

            {/* Low stock items */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                <AlertTriangle size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Low Stock Items</div>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444', margin: '8px 0 4px 0' }}>
                {lowStockCount}
              </h3>
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Requires replenishment</span>
            </div>

          </div>

          {/* Filters & Controls */}
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
                placeholder="Search ingredient by name or category..."
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

            {/* Category selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                <option value="All">All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Spices">Spices</option>
                <option value="Pantry Staples">Pantry Staples</option>
              </select>
            </div>

            {/* Status selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Status:</span>
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
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
                <option value="All">All Statuses</option>
                <option value="Available">Available Only</option>
                <option value="Low">Low Stock Only</option>
              </select>
            </div>
          </div>

          {/* Inventory Data Table */}
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
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Ingredient</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'center' }}>In-Stock Quantity</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'center' }}>Min safety Threshold</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                      No kitchen items found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isLow ? 'rgba(239, 68, 68, 0.02)' : 'transparent', transition: 'background-color 0.2s' }}>
                        
                        {/* Ingredient Name */}
                        <td style={{ padding: '16px 24px', fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {item.name}
                        </td>

                        {/* Category */}
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {item.category}
                        </td>

                        {/* Quantity with quick adjuster */}
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <button
                              onClick={() => handleAdjustQuantity(item.id, -1)}
                              style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                              <MinusCircle size={16} />
                            </button>
                            <span style={{ fontSize: '14.5px', fontWeight: '800', color: isLow ? '#ef4444' : 'var(--text-primary)', minWidth: '60px' }}>
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => handleAdjustQuantity(item.id, 1)}
                              style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                              <PlusCircle size={16} />
                            </button>
                          </div>
                        </td>

                        {/* Min Threshold */}
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          {item.minThreshold} {item.unit}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '800',
                            backgroundColor: isLow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isLow ? '#ef4444' : '#10b981'
                          }}>
                            {isLow ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                            {isLow ? 'Low Stock' : 'Available'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openEditModal(item)}
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
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* Add / Edit Modal Overlay */}
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
              {editingItem ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Ingredient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tomatoes"
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

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Spices">Spices</option>
                  <option value="Pantry Staples">Pantry Staples</option>
                </select>
              </div>

              {/* Unit of Measure */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Unit of Measure</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <option value="kg">kilograms (kg)</option>
                  <option value="g">grams (g)</option>
                  <option value="Liters">Liters (L)</option>
                  <option value="units">units (pc)</option>
                </select>
              </div>

              {/* Quantity & Threshold side by side */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Current Stock</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
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
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Min Threshold</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
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
                  Save Ingredient
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default KitchenInventory;

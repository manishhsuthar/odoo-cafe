import React, { useState } from 'react';
import { Search, Trash2, Edit2, Save, X } from 'lucide-react';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSCategoriesManagement = ({
  categoriesList,
  setCategoriesList,
  addLogEntry
}) => {
  const [searchCategoriesQuery, setSearchCategoriesQuery] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ea580c');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', color: '' });

  const handleEditClick = (detail) => {
    setEditCategoryId(detail.id);
    setEditCategoryData({ name: detail.name, color: detail.color });
  };

  const handleCancelEdit = () => {
    setEditCategoryId(null);
  };

  const handleSaveEdit = (catId, oldName) => {
    if (!editCategoryData.name) return;
    const current = JSON.parse(localStorage.getItem('categories') || '[]');
    const updated = current.map(c => 
      c.id === catId ? { ...c, name: editCategoryData.name, color: editCategoryData.color } : c
    );
    localStorage.setItem('categories', JSON.stringify(updated));
    setCategoriesList(updated.map(c => c.name));
    
    // Attempt to update products referencing this category in localStorage
    if (oldName !== editCategoryData.name) {
       const prods = JSON.parse(localStorage.getItem('products') || '[]');
       const updatedProds = prods.map(p => p.category === oldName ? { ...p, category: editCategoryData.name } : p);
       localStorage.setItem('products', JSON.stringify(updatedProds));
    }

    addLogEntry(`Updated category: ${editCategoryData.name}`, 'success');
    setEditCategoryId(null);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor
    };
    const current = JSON.parse(localStorage.getItem('categories') || '[]');
    current.push(newCat);
    localStorage.setItem('categories', JSON.stringify(current));
    setNewCategoryName('');

    // Update lists
    setCategoriesList(current.map(c => c.name));
    addLogEntry(`Added new category: ${newCat.name}`, 'success');
    alert('Category added successfully!');
  };

  const handleDeleteCategory = (catName) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const current = JSON.parse(localStorage.getItem('categories') || '[]');
      const updated = current.filter(c => c.name !== catName);
      localStorage.setItem('categories', JSON.stringify(updated));
      setCategoriesList(updated.map(c => c.name));
      addLogEntry(`Deleted category: ${catName}`, 'danger');
    }
  };

  return (
    <div style={bodyOrdersStyle}>
      {/* Categories Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Categories Management</h2>
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
            placeholder="Search categories..."
            value={searchCategoriesQuery}
            onChange={(e) => setSearchCategoriesQuery(e.target.value)}
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

      {/* Split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>

        {/* Left Column: Add Category Form */}
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
            Add New Category
          </h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Desserts"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
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
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Color Badge Theme *</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                {['#ea580c', '#0d9488', '#7c3aed', '#b45309', '#db2777', '#2563eb', '#16a34a', '#dc2626'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: newCategoryColor === color ? '3px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      transform: newCategoryColor === color ? 'scale(1.15)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  />
                ))}
              </div>
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
              Add Category
            </button>
          </form>
        </div>

        {/* Right Column: Categories List */}
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
                <th style={thStyle}>Category Name</th>
                <th style={thStyle}>Color Tag</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtered = categoriesList.filter(cat =>
                  cat.toLowerCase().includes(searchCategoriesQuery.toLowerCase())
                );
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No categories found.
                      </td>
                    </tr>
                  );
                }
                // Find colors from all categories loaded
                const catsDetails = JSON.parse(localStorage.getItem('categories') || '[]');
                return filtered.map(catName => {
                  const detail = catsDetails.find(d => d.name === catName) || { color: '#888' };
                  return (
                    <tr key={catName} style={{ borderBottom: '1.5px solid var(--border-color)', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      {editCategoryId === detail.id ? (
                        <>
                          <td style={tdStyle}>
                            <input
                              type="text"
                              value={editCategoryData.name}
                              onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                              style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1.5px solid var(--border-focus)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                            />
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="color"
                                value={editCategoryData.color}
                                onChange={(e) => setEditCategoryData({ ...editCategoryData, color: e.target.value })}
                                style={{ width: '30px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                              />
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{editCategoryData.color}</span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ ...tdStyle, fontWeight: '700' }}>{catName}</td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: detail.color }} />
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{detail.color}</span>
                            </div>
                          </td>
                        </>
                      )}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          {editCategoryId === detail.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(detail.id, catName)}
                                style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Save"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(detail)}
                                style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                                title="Edit Category"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(catName)}
                                style={{
                                  padding: '6px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s'
                                }}
                                title="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default POSCategoriesManagement;

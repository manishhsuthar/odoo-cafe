import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Table from '../../components/ui/Table';
import { PlusCircle, X, Trash2 } from 'lucide-react';
import { getCategories, addCategory, saveCategories } from '../../utils/db';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#0d9488' // Default teal
  });

  const colorOptions = [
    '#0d9488', // Teal
    '#ea580c', // Orange/Brown
    '#7c3aed', // Purple
    '#d97706', // Amber/Yellow
    '#2563eb'  // Blue
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      alert('Please enter a category name.');
      return;
    }

    addCategory({
      name: categoryForm.name,
      color: categoryForm.color
    });

    setCategoryForm({
      name: '',
      color: '#0d9488'
    });
    setIsModalOpen(false);
    loadCategories();
  };

  const handleDeleteCategory = (catId) => {
    if (window.confirm('Are you sure you want to delete this category? (Note: Products referencing this category will lose their group association)')) {
      const updated = categories.filter(c => c.id !== catId);
      saveCategories(updated);
      loadCategories();
    }
  };

  const headers = ['ID', 'Category Name', 'Accent Color', 'Visual Indicator', 'Actions'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Categories" />
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Categories Management</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Define product families, custom display groups, and kitchen routing tags.</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--border-focus)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              <PlusCircle size={18} />
              Add Category
            </button>
          </div>

          {/* Table Card wrapper */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            {categories.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No categories found. Add a category to get started.
              </div>
            ) : (
              <Table
                headers={headers}
                data={categories}
                renderRow={(category) => (
                  <>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>{category.id}</td>
                    <td style={{ padding: '16px 12px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{category.name}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>{category.color}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        backgroundColor: 'var(--bg-button)',
                        color: 'var(--text-primary)'
                      }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: category.color }}></span>
                        {category.name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
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
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </>
                )}
              />
            )}
          </div>
        </main>
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      {isModalOpen && (
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
            width: '420px',
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 className="handwritten" style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Category</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ff5c5c', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Category name input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Name</label>
                  <input 
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Food"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1.5px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '8px 0',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-bottom-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderBottomColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderBottomColor = 'var(--border-color)'}
                    required
                  />
                </div>

                {/* Color picker circles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: categoryForm.color === color ? '3px solid var(--text-primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.15s, border 0.15s',
                          transform: categoryForm.color === color ? 'scale(1.15)' : 'none',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#8c7662',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#726051'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8c7662'}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: '1.5px solid #8c7662',
                    color: '#8c7662',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(140, 118, 98, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Discard
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

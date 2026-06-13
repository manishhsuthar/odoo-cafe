import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Table from '../../components/ui/Table';
import { PlusCircle, X, Check, FolderPlus, Tag, Trash2, ArrowRight } from 'lucide-react';
import { getProducts, getCategories, addProduct, addCategory, deleteProduct } from '../../utils/db';

const Products = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Category dropdown menu state
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    tax: '5',
    category: '',
    description: ''
  });

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
    loadData();
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('add') === 'true') {
      setIsProductModalOpen(true);
    }
  }, [location]);

  const loadData = async () => {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectCategory = (catName) => {
    setProductForm(prev => ({
      ...prev,
      category: catName
    }));
    setIsCategoryDropdownOpen(false);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category) {
      alert('Please fill out Product Name, Price, and Category.');
      return;
    }

    const priceNum = parseFloat(productForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    addProduct({
      name: productForm.name,
      price: priceNum,
      tax: parseInt(productForm.tax),
      category: productForm.category,
      description: productForm.description
    });

    // Reset form & close modal
    setProductForm({
      name: '',
      price: '',
      tax: '5',
      category: '',
      description: ''
    });
    setIsProductModalOpen(false);
    loadData();
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      alert('Please enter a category name.');
      return;
    }

    // Add category
    const newCat = addCategory({
      name: categoryForm.name,
      color: categoryForm.color
    });

    // Set selected category in product form
    setProductForm(prev => ({
      ...prev,
      category: newCat.name
    }));

    // Reset category form & close category modal
    setCategoryForm({
      name: '',
      color: '#0d9488'
    });
    setIsCategoryModalOpen(false);
    setIsCategoryDropdownOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(prodId);
        loadData();
      } catch { }
    }
  };

  const headers = ['ID', 'Product Name', 'Category', 'Price', 'Tax Rate', 'Description', 'Stock Status', 'Actions'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Products" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Product Inventory</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Manage coffee shop offerings, prices, taxes, and categories.</p>
            </div>
            
            <button 
              onClick={() => setIsProductModalOpen(true)}
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
              Add Product
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
            {products.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No products found. Add a product to get started.
              </div>
            ) : (
              <Table
                headers={headers}
                data={products}
                renderRow={(product) => (
                  <>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>{product.id}</td>
                    <td style={{ padding: '16px 12px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{product.name}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: 'var(--bg-button)',
                        color: 'var(--text-link)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>₹{product.price}</td>
                    <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>{product.tax || 5}%</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.description || '-'}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: product.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: product.inStock ? '#10b981' : '#ef4444'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: product.inStock ? '#10b981' : '#ef4444' }}></span>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
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
                        title="Delete Product"
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

      {/* --- ADD PRODUCT MODAL (MATCHING IMAGE SPEC) --- */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            width: '600px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(191, 174, 158, 0.15)', color: 'var(--text-link)', width: '32px', height: '32px', borderRadius: '8px' }}>
                <FolderPlus size={18} />
              </div>
              <h3 className="handwritten" style={{ margin: 0, fontSize: '22px', color: 'var(--text-primary)' }}>New</h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Columns */}
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Product Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductInputChange}
                      placeholder="e.g. Masala Tea"
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

                  {/* Category dropdown field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Category</label>
                    <div 
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1.5px solid var(--border-color)',
                        padding: '8px 0',
                        cursor: 'pointer',
                        minHeight: '38px'
                      }}
                    >
                      {productForm.category ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-button)',
                          color: 'var(--text-link)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}>
                          {productForm.category}
                          <X 
                            size={12} 
                            style={{ cursor: 'pointer' }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductForm(prev => ({ ...prev, category: '' }));
                            }} 
                          />
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Select category...</span>
                      )}
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>v</span>
                    </div>

                    {/* Category Dropdown List */}
                    {isCategoryDropdownOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        boxShadow: 'var(--card-shadow)',
                        zIndex: 1010,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: '4px'
                      }}>
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => selectCategory(cat.name)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: productForm.category === cat.name ? 'var(--bg-button)' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                            onMouseLeave={(e) => {
                              if (productForm.category !== cat.name) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                              {cat.name}
                            </span>
                            {productForm.category === cat.name && <Check size={14} color="var(--border-focus)" />}
                          </div>
                        ))}
                        <div 
                          onClick={() => setIsCategoryModalOpen(true)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: 'var(--text-link)',
                            borderTop: '1px solid var(--border-color)',
                            backgroundColor: 'rgba(191, 174, 158, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(191, 174, 158, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(191, 174, 158, 0.05)'}
                        >
                          <PlusCircle size={14} />
                          Create & Edit
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Description */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Description</label>
                    <input 
                      type="text"
                      name="description"
                      value={productForm.description}
                      onChange={handleProductInputChange}
                      placeholder="e.g. Burger with cheese"
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
                    />
                  </div>

                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Price */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Price</label>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid var(--border-color)', position: 'relative' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: '16px', paddingBottom: '2px', marginRight: '4px' }}>₹</span>
                      <input 
                        type="number"
                        name="price"
                        value={productForm.price}
                        onChange={handleProductInputChange}
                        placeholder="65"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          padding: '8px 0',
                          fontSize: '15px',
                          outline: 'none',
                          width: '100%'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Tax Dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Tax</label>
                    <select
                      name="tax"
                      value={productForm.tax}
                      onChange={handleProductInputChange}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: '1.5px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '8px 0',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="5" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>5%</option>
                      <option value="18" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>18%</option>
                      <option value="28" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>28%</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
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
                  Discard
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--border-focus)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- NESTED CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
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
                onClick={() => setIsCategoryModalOpen(false)}
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
                    onChange={handleCategoryInputChange}
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
                  onClick={() => setIsCategoryModalOpen(false)}
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

export default Products;

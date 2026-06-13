import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { addProduct, getProducts, getCategories } from '../../../utils/db';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSProductsManagement = ({
  productsList,
  setProductsList,
  categoriesList,
  setCategoriesList,
  addLogEntry,
  handleToggleStock,
  handleDeleteProduct,
  searchCatalogQuery, setSearchCatalogQuery,
  newProdName, setNewProdName,
  newProdPrice, setNewProdPrice,
  newProdCategory, setNewProdCategory,
  newProdDesc, setNewProdDesc
}) => {
  return (
    <div style={bodyOrdersStyle}>
      {/* Products Page Header / Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Products Management</h2>

        {/* Search input for products catalog */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--input-bg)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '20px',
          padding: '10px 18px',
          width: '450px',
          transition: 'border-color 0.2s',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchCatalogQuery}
            onChange={(e) => setSearchCatalogQuery(e.target.value)}
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
          <Search size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Split layout: Left column Add Form, Right column Catalog List */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>

        {/* Left Column: Add Product Form Card */}
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
            Add New Product
          </h3>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!newProdName || !newProdPrice || !newProdCategory) {
              alert('Please fill out Name, Price and Category.');
              return;
            }
            const newProd = {
              name: newProdName,
              price: parseFloat(newProdPrice),
              category: newProdCategory,
              description: newProdDesc || 'Custom POS Product',
              tax: 5
            };
            try {
              const saved = await addProduct(newProd);
              addLogEntry(`Created and added new product: ${saved.name} to ${saved.category}`, 'success');

              // Refresh product lists
              const prods = await getProducts();
              setProductsList(prods);

              // Refresh categories list
              const cats = await getCategories();
              setCategoriesList(cats.map(c => c.name));

              // Clear form
              setNewProdName('');
              setNewProdPrice('');
              setNewProdCategory('');
              setNewProdDesc('');
              alert('Product added successfully!');
            } catch (err) {
              console.error(err);
              alert('Failed to add product');
            }
          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Masala Dosa"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
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

            {/* Price */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Price (₹) *</label>
              <input
                type="number"
                required
                step="0.01"
                placeholder="e.g. 120"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
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

            {/* Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Category *</label>
              <select
                required
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value)}
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
                <option value="">Select Category</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Description</label>
              <textarea
                placeholder="Brief description of product details..."
                rows="3"
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none'
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
              Add Product to Catalog
            </button>
          </form>
        </div>

        {/* Right Column: Products Catalog List Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          color: 'var(--text-primary)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14.5px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '2px solid var(--border-color)'
              }}>
                <th style={thStyle}>Product Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock Status</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtered = productsList.filter((prod) => {
                  const q = searchCatalogQuery.toLowerCase();
                  const name = (prod.name || '').toLowerCase();
                  const cat = (prod.category || '').toLowerCase();
                  return name.includes(q) || cat.includes(q);
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No products found in the catalog.
                      </td>
                    </tr>
                  );
                }

                return filtered.map((prod) => {
                  return (
                    <tr
                      key={prod.id}
                      style={{
                        borderBottom: '1.5px solid var(--border-color)',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ ...tdStyle, fontWeight: '700' }}>{prod.name}</td>
                      <td style={tdStyle}>{prod.category}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750' }}>₹{prod.price}</td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: prod.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: prod.inStock ? '#10b981' : '#ef4444'
                        }}>
                          {prod.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleStock(prod.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: prod.inStock ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              color: prod.inStock ? '#ef4444' : '#10b981',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >
                            {prod.inStock ? 'Set Out of Stock' : 'Set In Stock'}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
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
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
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

export default POSProductsManagement;

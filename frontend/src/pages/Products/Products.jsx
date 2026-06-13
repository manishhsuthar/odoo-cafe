import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Table from '../../components/ui/Table';

const Products = () => {
  const headers = ['ID', 'Product Name', 'Price', 'Stock', 'Category'];
  const sampleProducts = [
    { id: 'P001', name: 'Espresso', price: '$3.50', stock: 150, category: 'Beverages' },
    { id: 'P002', name: 'Croissant', price: '$2.80', stock: 45, category: 'Bakery' },
    { id: 'P003', name: 'Latte', price: '$4.20', stock: 120, category: 'Beverages' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Products" />
        <main style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="handwritten">Product Catalog</h2>
            <button className="handwritten" style={{
              backgroundColor: 'var(--bg-button)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}>+ Add Product</button>
          </div>
          <Table
            headers={headers}
            data={sampleProducts}
            renderRow={(product) => (
              <>
                <td style={{ padding: '12px' }}>{product.id}</td>
                <td style={{ padding: '12px' }}>{product.name}</td>
                <td style={{ padding: '12px' }}>{product.price}</td>
                <td style={{ padding: '12px' }}>{product.stock}</td>
                <td style={{ padding: '12px' }}>{product.category}</td>
              </>
            )}
          />
        </main>
      </div>
    </div>
  );
};

export default Products;

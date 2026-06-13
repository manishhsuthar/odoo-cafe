import React, { useState } from 'react';
import { Search } from 'lucide-react';

import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSOrdersHistory = ({
  ordersList,
  setSelectedOrderDetails
}) => {
  const [searchOrdersQuery, setSearchOrdersQuery] = useState('');

  return (
    <div style={bodyOrdersStyle}>
      {/* Search and Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Orders History</h2>

        {/* Search input for orders */}
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
            placeholder="Search by Customer Name, Order ID, or Date..."
            value={searchOrdersQuery}
            onChange={(e) => setSearchOrdersQuery(e.target.value)}
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

      {/* Orders Log Table container */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          color: 'var(--text-primary)',
          fontSize: '14.5px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '2px solid var(--border-color)'
            }}>
              <th style={thStyle}>Date & Time</th>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Table</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = ordersList.filter((ord) => {
                const q = searchOrdersQuery.toLowerCase();
                const customer = (ord.customerName || 'Walk-in Customer').toLowerCase();
                const orderId = (ord.id || '').toLowerCase();
                const table = (ord.table || 'Takeaway').toLowerCase();

                const dateObj = new Date(ord.dateTime);
                const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                const dateFull = dateObj.toLocaleDateString().toLowerCase();

                return (
                  customer.includes(q) ||
                  orderId.includes(q) ||
                  table.includes(q) ||
                  dateStr.includes(q) ||
                  dateFull.includes(q)
                );
              });

              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No orders found matching search criteria.
                    </td>
                  </tr>
                );
              }

              return filtered.map((ord) => {
                const dateObj = new Date(ord.dateTime);
                const dateFormatted = `${dateObj.getDate()}/${dateObj.getMonth() + 1} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                const isPaid = ord.status === 'Paid';

                return (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrderDetails(ord)}
                    style={{
                      borderBottom: '1.5px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={tdStyle}>{dateFormatted}</td>
                    <td style={{ ...tdStyle, color: '#3b82f6', fontWeight: '800' }}>{ord.id}</td>
                    <td style={tdStyle}>{ord.table || 'Takeaway'}</td>
                    <td style={tdStyle}>{ord.customerName || 'Walk-in Customer'}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-link)', fontWeight: '750' }}>₹{ord.amount}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isPaid ? '#10b981' : '#ef4444'
                      }}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default POSOrdersHistory;

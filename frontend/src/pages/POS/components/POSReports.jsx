import React from 'react';
import { bodyOrdersStyle } from './POSSharedStyles';

const POSReports = ({
  ordersList,
  logs,
  reloadManagementData
}) => {
  // Calculate statistics
  const totalRevenue = ordersList.reduce((acc, o) => acc + o.amount, 0);
  const totalOrdersCount = ordersList.length;
  const aov = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : 0;
  const unpaidRevenue = ordersList
    .filter(o => o.status === 'Unpaid')
    .reduce((acc, o) => acc + o.amount, 0);

  // Calculate payment method percentage statistics
  const paymentCounts = ordersList.reduce((acc, o) => {
    const method = o.paymentMethod || '-';
    acc[method] = (acc[method] || 0) + o.amount;
    return acc;
  }, {});

  return (
    <div style={bodyOrdersStyle}>
      {/* POS Analytics & Reports page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Business Reports & Dashboard</h2>
        <button
          onClick={reloadManagementData}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--border-focus)',
            color: 'var(--bg-primary)',
            border: 'none',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          Sync Data Log
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* Top Stats Cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

          {/* Revenue Card */}
          <div style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)',
            color: '#ffffff',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Gross Revenue</div>
            <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>₹{totalRevenue}</div>
            <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Aggregate sales values logged</div>
          </div>

          {/* Orders Card */}
          <div style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            color: '#ffffff',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Orders Handled</div>
            <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>{totalOrdersCount}</div>
            <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Total transactional orders registered</div>
          </div>

          {/* Average Ticket Value (AOV) Card */}
          <div style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            color: '#ffffff',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Average Ticket</div>
            <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>₹{aov}</div>
            <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Average billing price per cart</div>
          </div>

          {/* Unpaid Outstanding Card */}
          <div style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
            color: '#ffffff',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', opacity: 0.85, textTransform: 'uppercase' }}>Outstanding Unpaid</div>
            <div style={{ fontSize: '32px', fontWeight: '850', marginTop: '8px' }}>₹{unpaidRevenue}</div>
            <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>Receivables pending settlement</div>
          </div>

        </div>

        {/* Payment Distribution and Session Logs Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>

          {/* Payment Distribution Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            color: 'var(--text-primary)',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
              Sales Volume by Payment Option
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(paymentCounts).map(([method, amount]) => {
                const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0;
                return (
                  <div key={method} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700' }}>
                      <span>{method === '-' ? 'Unpaid Settlement' : method}</span>
                      <span>₹{amount} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor:
                          method === 'UPI' ? '#0d9488' :
                            method === 'Cash' ? '#ea580c' :
                              method === 'Card' ? '#7c3aed' : '#ef4444',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(paymentCounts).length === 0 && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  No sales records computed yet.
                </div>
              )}
            </div>
          </div>

          {/* Active Session Logs Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            color: 'var(--text-primary)',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px' }}>
              Active POS Operations Logs
            </h3>
            <div style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  borderLeft: `4px solid ${log.type === 'success' ? '#10b981' :
                    log.type === 'warning' ? '#ea580c' :
                      log.type === 'danger' ? '#ef4444' : 'var(--text-secondary)'
                    }`,
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{log.message}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>{log.time}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  No session activity logs registered.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default POSReports;

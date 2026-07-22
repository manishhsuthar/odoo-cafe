import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, TrendingUp, Receipt, BarChart3, Clock } from 'lucide-react';
import { bodyOrdersStyle } from './POSSharedStyles';
import { getReportsSummary } from '../../../utils/db';

import useAuth from '../../../hooks/useAuth';

const POSReports = ({
  ordersList,
  logs,
  reloadManagementData
}) => {
  const { user } = useAuth();
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    aov: 0
  });

  const fetchBackendSummary = async () => {
    try {
      const summary = await getReportsSummary();
      setSummaryData({
        totalRevenue: parseFloat(summary.totalRevenue || 0),
        totalOrdersCount: parseInt(summary.totalOrders || 0),
        aov: parseFloat(summary.avgOrderValue || 0)
      });
    } catch (err) {
      console.error("Failed to fetch reports summary:", err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBackendSummary();
    }
  }, [ordersList, user]);

  if (user && user.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <h2>Access Denied</h2>
        <p>Reports and Analytics are restricted to Admin users only.</p>
      </div>
    );
  }

  // Calculate statistics
  const totalRevenue = summaryData.totalRevenue;
  const totalOrdersCount = summaryData.totalOrdersCount;
  const aov = summaryData.aov.toFixed(2);
  const unpaidRevenue = ordersList
    .filter(o => o.status === 'Unpaid' || o.status === 'pending')
    .reduce((acc, o) => acc + parseFloat(o.amount || 0), 0);

  // Calculate payment method percentage statistics
  const paymentCounts = ordersList.reduce((acc, o) => {
    const method = o.paymentMethod || '-';
    acc[method] = (acc[method] || 0) + parseFloat(o.amount || 0);
    return acc;
  }, {});

  const handleExportXLS = () => {
    let csvContent = "POS ANALYTICS REPORT\r\nGenerated At," + new Date().toLocaleString() + "\r\n\r\n";
    csvContent += "METRIC,VALUE\r\n";
    csvContent += `Gross Revenue,INR ${totalRevenue}\r\n`;
    csvContent += `Orders Handled,${totalOrdersCount}\r\n`;
    csvContent += `Average Ticket,INR ${aov}\r\n`;
    csvContent += `Outstanding Unpaid,INR ${unpaidRevenue}\r\n\r\n`;
    
    csvContent += "PAYMENT DISTRIBUTION\r\nMethod,Amount\r\n";
    Object.entries(paymentCounts).forEach(([method, amount]) => {
      csvContent += `${method === '-' ? 'Unpaid Settlement' : method},${amount}\r\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "pos_analytics_report.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadOpen(false);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    const isLight = document.body.classList.contains('light-theme');

    const htmlContent = `
      <html>
        <head>
          <title>POS Analytics Report</title>
          <style>
            body { font-family: 'Outfit', sans-serif; background-color: ${isLight ? '#ffffff' : '#110f0d'}; color: ${isLight ? '#2b2621' : '#ffffff'}; padding: 40px; margin: 0; }
            h2 { border-bottom: 2px solid ${isLight ? '#e6ded6' : '#2d2621'}; padding-bottom: 10px; margin-bottom: 5px; }
            .meta { margin-bottom: 30px; font-size: 14px; color: ${isLight ? '#70645a' : '#a0958a'}; }
            .grid { display: flex; gap: 20px; margin-bottom: 30px; }
            .card { flex: 1; background-color: ${isLight ? '#faf8f5' : '#1c1714'}; border: 1px solid ${isLight ? '#e6ded6' : '#2d2621'}; border-radius: 12px; padding: 20px; text-align: left; }
            .card-title { font-size: 13px; color: ${isLight ? '#70645a' : '#a0958a'}; font-weight: bold; }
            .card-value { font-size: 28px; font-weight: bold; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid ${isLight ? '#e6ded6' : '#2d2621'}; }
            th { background-color: ${isLight ? '#f5ece1' : '#181411'}; color: ${isLight ? '#70645a' : '#a0958a'}; font-weight: bold; }
            tr:nth-child(even) { background-color: ${isLight ? '#faf8f5' : '#181411'}; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>POS Analytics Report</h2>
          <div class="meta"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          <div class="grid">
            <div class="card"><div class="card-title">Gross Revenue</div><div class="card-value">₹${totalRevenue.toLocaleString()}</div></div>
            <div class="card"><div class="card-title">Orders Handled</div><div class="card-value">${totalOrdersCount}</div></div>
            <div class="card"><div class="card-title">Average Ticket</div><div class="card-value">₹${aov}</div></div>
            <div class="card"><div class="card-title">Outstanding Unpaid</div><div class="card-value">₹${unpaidRevenue}</div></div>
          </div>
          <div class="section-title">Payment Distribution</div>
          <table>
            <thead><tr><th>Payment Method</th><th>Amount</th><th>Percentage</th></tr></thead>
            <tbody>
              ${Object.entries(paymentCounts).map(([method, amount]) => {
                const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0;
                return `<tr><td><strong>${method === '-' ? 'Unpaid Settlement' : method}</strong></td><td>₹${amount}</td><td>${percentage}%</td></tr>`;
              }).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsDownloadOpen(false);
  };


  return (
    <div style={bodyOrdersStyle}>
      {/* POS Analytics & Reports page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Business Reports & Dashboard</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Download Report Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'var(--bg-button)', color: 'var(--text-primary)',
                border: '1.5px solid var(--border-color)', borderRadius: '12px',
                padding: '10px 16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Download size={16} />
              <span>Export Reports</span>
              <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isDownloadOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {isDownloadOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
                borderRadius: '12px', boxShadow: 'var(--card-shadow)', minWidth: '180px',
                zIndex: 20, overflow: 'hidden'
              }}>
                <div
                  onClick={handleExportPDF}
                  style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Export as PDF (.pdf)
                </div>
                <div
                  onClick={handleExportXLS}
                  style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Export as Excel (.xls)
                </div>
              </div>
            )}
          </div>

          <button
            onClick={reloadManagementData}
            style={{
              padding: '10px 16px', borderRadius: '12px',
              backgroundColor: 'var(--border-focus)', color: 'var(--bg-primary)',
              border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '14px'
            }}
          >
            Sync Data Log
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* Top Stats Cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', position: 'relative', textAlign: 'left' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Gross Revenue</span>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>₹{totalRevenue.toLocaleString()}</h3>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', position: 'relative', textAlign: 'left' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(191, 174, 158, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-link)', marginBottom: '16px' }}>
              <Receipt size={18} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Orders Handled</span>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>{totalOrdersCount}</h3>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', position: 'relative', textAlign: 'left' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '16px' }}>
              <BarChart3 size={18} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Average Ticket</span>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>₹{aov}</h3>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--card-shadow)', position: 'relative', textAlign: 'left' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
              <Clock size={18} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Outstanding Unpaid</span>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>₹{unpaidRevenue}</h3>
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

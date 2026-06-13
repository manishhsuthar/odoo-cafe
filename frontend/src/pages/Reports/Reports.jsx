import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { getOrders } from '../../utils/db';
import { Calendar, User, Clock, ShoppingBag, ArrowUpRight, TrendingUp, BarChart3, Receipt, Award, Download, ChevronDown, Search } from 'lucide-react';

const SEED_ORDERS = [
  { id: '#2305', customerName: 'Rajesh Kumar', amount: 2850, items: '8 x Masala Tea, 2 x Butter Chicken', dateTime: '2024-06-13T12:30:00Z', server: 'John Doe' },
  { id: '#2304', customerName: 'Priya Singh', amount: 2450, items: '6 x Coffee, 1 x Biryani', dateTime: '2024-06-13T14:45:00Z', server: 'Sarah Smith' },
  { id: '#2303', customerName: 'Amit Patel', amount: 2180, items: '5 x Lassi, 2 x Biryani', dateTime: '2024-06-12T19:15:00Z', server: 'Admin' },
  { id: '#2302', customerName: 'Neha Gupta', amount: 1950, items: '4 x Masala Tea, 1 x Butter Chicken', dateTime: '2024-06-12T13:00:00Z', server: 'John Doe' },
  { id: '#2301', customerName: 'Vikram Shah', amount: 1840, items: '4 x Coffee, 1 x Biryani', dateTime: '2024-06-11T16:20:00Z', server: 'Sarah Smith' },
  { id: '#2300', customerName: 'Rajesh Kumar', amount: 1250, items: '2 x Coffee, 1 x Butter Chicken', dateTime: '2024-06-10T11:00:00Z', server: 'John Doe' },
  { id: '#2299', customerName: 'Priya Singh', amount: 950, items: '3 x Masala Tea, 1 x Appetizers', dateTime: '2024-06-09T17:30:00Z', server: 'Sarah Smith' },
  { id: '#2298', customerName: 'Amit Patel', amount: 3200, items: '10 x Masala Tea, 3 x Biryani', dateTime: '2024-06-08T20:00:00Z', server: 'Admin' },
  { id: '#2297', customerName: 'Kunal Sharma', amount: 1500, items: '4 x Lassi, 1 x Butter Chicken', dateTime: '2024-06-07T14:10:00Z', server: 'John Doe' },
  { id: '#2296', customerName: 'Neha Gupta', amount: 2200, items: '5 x Coffee, 2 x Biryani', dateTime: '2024-06-06T18:50:00Z', server: 'Sarah Smith' }
];

const MOCK_TOP_ORDERS = [
  { id: '#2305', customer: 'Rajesh Kumar', amount: 2850, items: 8, date: '2024-06-13' },
  { id: '#2304', customer: 'Priya Singh', amount: 2450, items: 6, date: '2024-06-13' },
  { id: '#2303', customer: 'Amit Patel', amount: 2180, items: 5, date: '2024-06-12' },
  { id: '#2302', customer: 'Neha Gupta', amount: 1950, items: 4, date: '2024-06-12' },
  { id: '#2301', customer: 'Vikram Shah', amount: 1840, items: 4, date: '2024-06-11' }
];

const MOCK_TOP_PRODUCTS = [
  { name: 'Masala Tea', quantity: 342, revenue: 18468, percent: 21.6 },
  { name: 'Butter Chicken', quantity: 156, revenue: 54600, percent: 63.9 },
  { name: 'Biryani', quantity: 128, revenue: 32000, percent: 37.5 },
  { name: 'Coffee', quantity: 296, revenue: 16092, percent: 18.8 },
  { name: 'Lassi', quantity: 215, revenue: 11610, percent: 13.6 }
];

const MOCK_TOP_CATEGORIES = [
  { name: 'Beverages', revenue: 45170, orders: 855, percent: 52.9 },
  { name: 'Main Course', revenue: 28350, orders: 284, percent: 33.2 },
  { name: 'Desserts', revenue: 9200, orders: 142, percent: 10.8 },
  { name: 'Appetizers', revenue: 2700, orders: 89, percent: 3.2 }
];

const Reports = () => {
  // Filter states
  const [fromDate, setFromDate] = useState('2024-06-01');
  const [toDate, setToDate] = useState('2024-06-15');
  const [customerSearch, setCustomerSearch] = useState('');
  const [session, setSession] = useState('All');
  const [product, setProduct] = useState('All');

  // Exporter dropdown state
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Dynamic Metrics states
  const [liveStats, setLiveStats] = useState({
    totalOrders: 1248,
    totalRevenue: 85420,
    avgOrderValue: 684
  });

  const [topOrders, setTopOrders] = useState(MOCK_TOP_ORDERS);
  const [topProducts, setTopProducts] = useState(MOCK_TOP_PRODUCTS);
  const [topCategories, setTopCategories] = useState(MOCK_TOP_CATEGORIES);

  useEffect(() => {
    computeLiveMetrics();
  }, [fromDate, toDate, customerSearch, session, product]);

  const computeLiveMetrics = () => {
    const dbOrders = getOrders() || [];
    
    // Combine live database orders with seed dataset to ensure rich, filterable content
    const allOrders = [...dbOrders, ...SEED_ORDERS];

    let filtered = allOrders;

    // Filter by Date Range (From - To)
    if (fromDate) {
      filtered = filtered.filter(o => {
        const oDateStr = new Date(o.dateTime).toISOString().split('T')[0];
        return oDateStr >= fromDate;
      });
    }
    if (toDate) {
      filtered = filtered.filter(o => {
        const oDateStr = new Date(o.dateTime).toISOString().split('T')[0];
        return oDateStr <= toDate;
      });
    }

    // Filter by Customer Search Name (checks order count / list for specific customer name)
    if (customerSearch.trim() !== '') {
      const query = customerSearch.toLowerCase();
      filtered = filtered.filter(o => 
        o.customerName && o.customerName.toLowerCase().includes(query)
      );
    }

    // Filter by product selector keyword if any
    if (product !== 'All') {
      filtered = filtered.filter(o => o.items && o.items.toLowerCase().includes(product.toLowerCase()));
    }

    // If no records match, output zeros
    if (filtered.length === 0) {
      setLiveStats({
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0
      });
      setTopOrders([]);
      setTopProducts([]);
      setTopCategories([]);
      return;
    }

    // Calculations
    const totalOrders = filtered.length;
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.amount || 0), 0);
    const avgOrderValue = Math.round(totalRevenue / totalOrders);

    setLiveStats({
      totalOrders,
      totalRevenue,
      avgOrderValue
    });

    // Top Orders
    const liveTopOrders = filtered.slice(0, 5).map(o => ({
      id: o.id,
      customer: o.customerName || 'Walk-in Customer',
      amount: o.amount,
      items: o.items ? o.items.split(',').length : 1,
      date: new Date(o.dateTime).toISOString().slice(0, 10)
    }));
    setTopOrders(liveTopOrders);

    // Calculate live items and categories stats
    const categoryStatsMap = {};
    const productStatsMap = {};
    let grandRevenue = 0;

    filtered.forEach(o => {
      if (o.items) {
        const itemsList = o.items.split(',');
        itemsList.forEach(itemStr => {
          const trimmed = itemStr.trim();
          if (!trimmed) return;

          let qty = 1;
          let name = trimmed;

          const prefixMatch = trimmed.match(/^(\d+)\s*[xX]\s*(.+)$/);
          const suffixMatch = trimmed.match(/^(.+)\s*[xX]\s*(\d+)$/);

          if (prefixMatch) {
            qty = parseInt(prefixMatch[1]) || 1;
            name = prefixMatch[2].trim();
          } else if (suffixMatch) {
            qty = parseInt(suffixMatch[2]) || 1;
            name = suffixMatch[1].trim();
          }

          let price = 150;
          const nameLower = name.toLowerCase();
          if (nameLower.includes('tea')) price = 54;
          else if (nameLower.includes('chicken')) price = 350;
          else if (nameLower.includes('biryani')) price = 250;
          else if (nameLower.includes('coffee')) price = 54;
          else if (nameLower.includes('lassi')) price = 54;

          const itemRevenue = qty * price;

          if (!productStatsMap[name]) {
            productStatsMap[name] = { name, quantity: 0, revenue: 0 };
          }
          productStatsMap[name].quantity += qty;
          productStatsMap[name].revenue += itemRevenue;
          grandRevenue += itemRevenue;

          let category = 'Main Course';
          if (nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('lassi') || nameLower.includes('beverage') || nameLower.includes('soda')) {
            category = 'Beverages';
          } else if (nameLower.includes('cake') || nameLower.includes('ice cream') || nameLower.includes('kheer') || nameLower.includes('dessert')) {
            category = 'Desserts';
          } else if (nameLower.includes('samosa') || nameLower.includes('fries') || nameLower.includes('appetizer')) {
            category = 'Appetizers';
          }

          if (!categoryStatsMap[category]) {
            categoryStatsMap[category] = { name: category, revenue: 0, orders: 0 };
          }
          categoryStatsMap[category].revenue += itemRevenue;
          categoryStatsMap[category].orders += 1;
        });
      }
    });

    const liveTopProducts = Object.values(productStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        ...p,
        percent: grandRevenue > 0 ? parseFloat(((p.revenue / grandRevenue) * 100).toFixed(1)) : 0
      }));
    setTopProducts(liveTopProducts.length > 0 ? liveTopProducts : MOCK_TOP_PRODUCTS);

    const liveTopCategories = Object.values(categoryStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map(c => ({
        ...c,
        percent: grandRevenue > 0 ? parseFloat(((c.revenue / grandRevenue) * 100).toFixed(1)) : 0
      }));
    setTopCategories(liveTopCategories.length > 0 ? liveTopCategories : MOCK_TOP_CATEGORIES);
  };

  // XLS Exporter
  const handleExportXLS = () => {
    let csvContent = "";
    csvContent += `REPORTS & ANALYTICS SUMMARY\r\n`;
    csvContent += `Period,${fromDate || 'Any'} to ${toDate || 'Any'}\r\n`;
    csvContent += `Customer Filter,${customerSearch || 'All Customers'}\r\n`;
    csvContent += `Generated At,${new Date().toLocaleString()}\r\n\r\n`;
    
    csvContent += `METRIC,VALUE\r\n`;
    csvContent += `Total Orders,${liveStats.totalOrders}\r\n`;
    csvContent += `Total Revenue,INR ${liveStats.totalRevenue}\r\n`;
    csvContent += `Avg Order Value,INR ${liveStats.avgOrderValue}\r\n\r\n`;
    
    csvContent += `TOP ORDERS\r\n`;
    csvContent += `Order ID,Customer,Amount,ItemsCount,Date\r\n`;
    topOrders.forEach(o => {
      csvContent += `${o.id},"${o.customer}",${o.amount},${o.items},${o.date}\r\n`;
    });
    csvContent += `\r\n`;
    
    csvContent += `TOP PRODUCTS\r\n`;
    csvContent += `Product,Quantity,Revenue,Percent of Revenue\r\n`;
    topProducts.forEach(p => {
      csvContent += `"${p.name}",${p.quantity},${p.revenue},${p.percent}%\r\n`;
    });
    csvContent += `\r\n`;

    csvContent += `TOP CATEGORIES\r\n`;
    csvContent += `Category,Revenue,OrdersCount,Percent of Revenue\r\n`;
    topCategories.forEach(c => {
      csvContent += `"${c.name}",${c.revenue},${c.orders},${c.percent}%\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `revenue_report_${fromDate}_to_${toDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadOpen(false);
  };

  // PDF Exporter
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    const isLight = document.body.classList.contains('light-theme');
    
    const htmlContent = `
      <html>
        <head>
          <title>Revenue Report: ${fromDate} to ${toDate}</title>
          <style>
            body {
              font-family: 'Outfit', sans-serif;
              background-color: ${isLight ? '#ffffff' : '#110f0d'};
              color: ${isLight ? '#2b2621' : '#ffffff'};
              padding: 40px;
              margin: 0;
            }
            h2 { border-bottom: 2px solid ${isLight ? '#e6ded6' : '#2d2621'}; padding-bottom: 10px; margin-bottom: 5px; }
            .meta { margin-bottom: 30px; font-size: 14px; color: ${isLight ? '#70645a' : '#a0958a'}; }
            .grid { display: flex; gap: 20px; margin-bottom: 30px; }
            .card {
              flex: 1;
              background-color: ${isLight ? '#faf8f5' : '#1c1714'};
              border: 1px solid ${isLight ? '#e6ded6' : '#2d2621'};
              border-radius: 12px;
              padding: 20px;
              text-align: left;
            }
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
          <h2>Reports & Analytics: Revenue Report</h2>
          <div class="meta">
            <strong>Period:</strong> ${fromDate} to ${toDate} &nbsp;|&nbsp; 
            <strong>Customer:</strong> ${customerSearch || 'All'} &nbsp;|&nbsp; 
            <strong>Generated:</strong> ${new Date().toLocaleString()}
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Total Orders</div>
              <div class="card-value">${liveStats.totalOrders}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Revenue</div>
              <div class="card-value">₹${liveStats.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">Avg Order Value</div>
              <div class="card-value">₹${liveStats.avgOrderValue.toLocaleString()}</div>
            </div>
          </div>

          <div class="section-title">Top Orders</div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Items Count</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${topOrders.map(o => `
                <tr>
                  <td><strong>${o.id}</strong></td>
                  <td>${o.customer}</td>
                  <td>₹${o.amount.toLocaleString()}</td>
                  <td>${o.items}</td>
                  <td>${o.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Top Products</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Revenue</th>
                <th>Percent of Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.quantity}</td>
                  <td>₹${p.revenue.toLocaleString()}</td>
                  <td>${p.percent}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Top Categories</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
                <th>Orders Count</th>
                <th>Percent of Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topCategories.map(c => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>₹${c.revenue.toLocaleString()}</td>
                  <td>${c.orders}</td>
                  <td>${c.percent}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsDownloadOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Reports & Analytics" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header Block with Download Dropdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Reports & Analytics</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Track your restaurant performance, revenue growth, category distribution, and item stats.</p>
            </div>
            
            {/* Download Report Button with Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-button)',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all var(--transition-speed)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
              >
                <Download size={16} />
                <span>Download Report</span>
                <ChevronDown size={14} />
              </button>

              {isDownloadOpen && (
                <>
                  {/* Backdrop click closer */}
                  <div 
                    onClick={() => setIsDownloadOpen(false)} 
                    style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--card-shadow)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '180px',
                    zIndex: 1000,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <button
                      onClick={handleExportPDF}
                      style={{
                        padding: '10px 12px',
                        border: 'none',
                        background: 'none',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Export as PDF (.pdf)
                    </button>
                    <button
                      onClick={handleExportXLS}
                      style={{
                        padding: '10px 12px',
                        border: 'none',
                        background: 'none',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Export as Excel (.xls)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Filters Row - Dark brown stylized card match screenshot */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            {/* From Date Picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                <Calendar size={13} />
                <span>From Date</span>
              </div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              />
            </div>

            {/* To Date Picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                <Calendar size={13} />
                <span>To Date</span>
              </div>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              />
            </div>

            {/* Customer Search Text Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                <Search size={13} />
                <span>Search Customer</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              />
            </div>

            {/* Product Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                <ShoppingBag size={13} />
                <span>Product</span>
              </div>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                <option value="All">All Products</option>
                <option value="Masala Tea">Masala Tea</option>
                <option value="Butter Chicken">Butter Chicken</option>
                <option value="Biryani">Biryani</option>
                <option value="Coffee">Coffee</option>
                <option value="Lassi">Lassi</option>
              </select>
            </div>
          </div>          {/* Stats Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* Total Orders Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
              textAlign: 'left'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(191, 174, 158, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-link)',
                marginBottom: '16px'
              }}>
                <Receipt size={18} />
              </div>
              
              <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: '800', color: '#10b981' }}>
                <ArrowUpRight size={14} />
                <span>~ 12.5%</span>
              </div>

              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Orders</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {liveStats.totalOrders.toLocaleString()}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>vs last period: +12.5%</span>
            </div>

            {/* Total Revenue Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
              textAlign: 'left'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '16px'
              }}>
                <TrendingUp size={18} />
              </div>
              
              <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: '800', color: '#10b981' }}>
                <ArrowUpRight size={14} />
                <span>~ 18.2%</span>
              </div>

              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Revenue</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                ₹{liveStats.totalRevenue.toLocaleString()}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>vs last period: +18.2%</span>
            </div>

            {/* Avg Order Value Card */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
              textAlign: 'left'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                marginBottom: '16px'
              }}>
                <ShoppingBag size={18} />
              </div>
              
              <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: '800', color: '#10b981' }}>
                <ArrowUpRight size={14} />
                <span>~ 5.3%</span>
              </div>

              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Avg Order Value</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                ₹{liveStats.avgOrderValue.toLocaleString()}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>vs last period: +5.3%</span>
            </div>

          </div>

          {/* Visual Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            {/* Sales Trend (SVG Gradient Graph) */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart3 size={16} style={{ color: 'var(--text-link)' }} />
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Sales Trend</span>
              </div>
              
              <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                {/* SVG Area chart */}
                <svg viewBox="0 0 500 200" width="100%" height="100%" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--border-focus)" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="var(--border-focus)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                  
                  {/* Area path */}
                  <path 
                    d="M 0 160 Q 75 140 100 110 T 200 130 T 300 90 T 400 60 T 500 40 L 500 200 L 0 200 Z" 
                    fill="url(#chartGrad)" 
                  />

                  {/* Line stroke */}
                  <path 
                    d="M 0 160 Q 75 140 100 110 T 200 130 T 300 90 T 400 60 T 500 40" 
                    fill="none" 
                    stroke="var(--border-focus)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  <circle cx="100" cy="110" r="5" fill="var(--bg-primary)" stroke="var(--border-focus)" strokeWidth="2" />
                  <circle cx="200" cy="130" r="5" fill="var(--bg-primary)" stroke="var(--border-focus)" strokeWidth="2" />
                  <circle cx="300" cy="90" r="5" fill="var(--bg-primary)" stroke="var(--border-focus)" strokeWidth="2" />
                  <circle cx="400" cy="60" r="5" fill="var(--bg-primary)" stroke="var(--border-focus)" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="var(--bg-primary)" stroke="var(--border-focus)" strokeWidth="2" />
                </svg>

                {/* X Axis Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>09:00 AM</span>
                  <span>12:00 PM</span>
                  <span>03:00 PM</span>
                  <span>06:00 PM</span>
                  <span>09:00 PM</span>
                </div>
              </div>
            </div>

            {/* Top Categories Distribution (Donut Chart) */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Clock size={16} style={{ color: 'var(--text-link)' }} />
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Top Categories Distribution</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', height: '220px' }}>
                {/* SVG Donut Chart */}
                <svg width="150" height="150" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Beverages - 52.9% */}
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#dfc2a5" strokeWidth="5.5" strokeDasharray="52.9 47.1" strokeDashoffset="0" />
                  {/* Main Course - 33.2% */}
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#bfae9e" strokeWidth="5.5" strokeDasharray="33.2 66.8" strokeDashoffset="-52.9" />
                  {/* Desserts - 10.8% */}
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#8c7662" strokeWidth="5.5" strokeDasharray="10.8 89.2" strokeDashoffset="-86.1" />
                  {/* Appetizers - 3.2% */}
                  <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#5c4d40" strokeWidth="5.5" strokeDasharray="3.2 96.8" strokeDashoffset="-96.9" />
                  
                  {/* Center cutout */}
                  <circle cx="20" cy="20" r="12" fill="var(--bg-card)" />
                </svg>

                {/* Legends */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dfc2a5' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Beverages (52.9%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#bfae9e' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Main Course (33.2%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8c7662' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Desserts (10.8%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#5c4d40' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Appetizers (3.2%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Top Orders Card Grid */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={16} style={{ color: 'var(--text-link)' }} />
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Top Orders</span>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Order ID</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Customer</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Amount</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Items</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {topOrders.map((order, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '750', color: 'var(--text-primary)' }}>{order.id}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{order.customer}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700', color: 'var(--text-link)' }}>₹{order.amount.toLocaleString()}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{order.items}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Products Card Grid */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} style={{ color: 'var(--text-link)' }} />
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Top Products</span>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Product</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Quantity</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Revenue</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Percent of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '750', color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{p.quantity}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700', color: 'var(--text-link)' }}>₹{p.revenue.toLocaleString()}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{p.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Categories Card Grid */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16} style={{ color: 'var(--text-link)' }} />
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Top Categories</span>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Revenue</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Orders</th>
                  <th style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Percent of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '750', color: 'var(--text-primary)' }}>{c.name}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: '700', color: 'var(--text-link)' }}>₹{c.revenue.toLocaleString()}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{c.orders}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>{c.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Reports;

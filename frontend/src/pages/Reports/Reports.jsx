import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { getOrders } from '../../utils/db';
import { Calendar, User, Clock, ShoppingBag, ArrowUpRight, TrendingUp, BarChart3, Receipt, Award, Download, ChevronDown, Search } from 'lucide-react';

const getMockDate = (daysAgo, hour, minute) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const MOCK_REPORTS_ORDERS = [
  {
    id: 'ORD-1001',
    dateTime: getMockDate(0, 9, 30),
    customerName: 'Rajesh Kumar',
    table: 'Table 4',
    items: '2 x Espresso Coffee, 1 x Paneer Tikka Sandwich',
    paymentMethod: 'UPI',
    amount: 330,
    status: 'Paid'
  },
  {
    id: 'ORD-1002',
    dateTime: getMockDate(0, 12, 15),
    customerName: 'Anita Singh',
    table: 'Table 12',
    items: '1 x Cappuccino Coffee, 1 x Chocolate Ice Cream',
    paymentMethod: 'Card',
    amount: 230,
    status: 'Paid'
  },
  {
    id: 'ORD-1003',
    dateTime: getMockDate(0, 15, 0),
    customerName: 'Amit Patel',
    table: 'Table 2',
    items: '2 x Masala Tea, 1 x French Fries',
    paymentMethod: 'UPI',
    amount: 220,
    status: 'Paid'
  },
  {
    id: 'ORD-1004',
    dateTime: getMockDate(0, 18, 45),
    customerName: 'Sneha Reddy',
    table: 'Walk-in',
    items: '1 x Cafe Latte Coffee, 1 x Garlic Bread',
    paymentMethod: 'Cash',
    amount: 200,
    status: 'Paid'
  },
  {
    id: 'ORD-1005',
    dateTime: getMockDate(1, 10, 0),
    customerName: 'Priya Sharma',
    table: 'Table 8',
    items: '1 x Paneer Curry, 2 x Roti, 1 x Mango Lassi',
    paymentMethod: 'UPI',
    amount: 450,
    status: 'Paid'
  },
  {
    id: 'ORD-1006',
    dateTime: getMockDate(1, 13, 30),
    customerName: 'John Doe',
    table: 'Table 5',
    items: '1 x Veg Biryani Rice, 1 x Pepsi Soda',
    paymentMethod: 'Card',
    amount: 380,
    status: 'Paid'
  },
  {
    id: 'ORD-1007',
    dateTime: getMockDate(1, 20, 0),
    customerName: 'Vikram Malhotra',
    table: 'Table 1',
    items: '1 x Chicken Curry, 2 x Naan, 1 x Chocolate Ice Cream',
    paymentMethod: 'UPI',
    amount: 520,
    status: 'Paid'
  },
  {
    id: 'ORD-1008',
    dateTime: getMockDate(2, 8, 45),
    customerName: 'Karan Johar',
    table: 'Table 3',
    items: '2 x Masala Tea, 1 x Veg Samosa Appetizer',
    paymentMethod: 'Cash',
    amount: 180,
    status: 'Paid'
  },
  {
    id: 'ORD-1009',
    dateTime: getMockDate(2, 12, 0),
    customerName: 'Sunita Williams',
    table: 'Walk-in',
    items: '1 x Paneer Tikka Sandwich, 1 x French Fries, 1 x Pepsi Soda',
    paymentMethod: 'Card',
    amount: 410,
    status: 'Paid'
  },
  {
    id: 'ORD-1010',
    dateTime: getMockDate(3, 19, 15),
    customerName: 'Rohan Mehra',
    table: 'Table 7',
    items: '1 x Veg Pizza, 1 x Garlic Bread, 2 x Coca Cola Soda',
    paymentMethod: 'UPI',
    amount: 650,
    status: 'Paid'
  },
  {
    id: 'ORD-1011',
    dateTime: getMockDate(4, 11, 30),
    customerName: 'Meera Nair',
    table: 'Table 6',
    items: '1 x Cappuccino Coffee, 1 x Chocolate Cake Dessert',
    paymentMethod: 'Card',
    amount: 270,
    status: 'Paid'
  },
  {
    id: 'ORD-1012',
    dateTime: getMockDate(5, 14, 0),
    customerName: 'Rahul Dravid',
    table: 'Table 10',
    items: '1 x Chicken Biryani Rice, 1 x Mango Lassi',
    paymentMethod: 'UPI',
    amount: 480,
    status: 'Paid'
  }
];

const Reports = () => {
  const todayStr = new Date().toLocaleDateString('en-CA');

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [session, setSession] = useState('All');
  const [product, setProduct] = useState('All');

  // Exporter dropdown state
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Dynamic Metrics states
  const [liveStats, setLiveStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  const [topOrders, setTopOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Hover states for details display
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    computeLiveMetrics();
  }, [fromDate, toDate, customerSearch, session, product]);

  const handleFromDateChange = (val) => {
    if (val > todayStr) {
      alert("From Date cannot be in the future!");
      return;
    }
    if (toDate && val > toDate) {
      alert("From Date cannot be after To Date!");
      return;
    }
    setFromDate(val);
  };

  const handleToDateChange = (val) => {
    if (val > todayStr) {
      alert("To Date cannot be in the future!");
      return;
    }
    if (fromDate && val < fromDate) {
      alert("To Date cannot be before From Date!");
      return;
    }
    setToDate(val);
  };

  const handleCustomerSearchChange = (val) => {
    if (val.length > 50) {
      alert("Customer name search cannot exceed 50 characters!");
      return;
    }
    // Only allow letters, spaces, periods, and hyphens
    const filtered = val.replace(/[^a-zA-Z\s\.\-]/g, '');
    setCustomerSearch(filtered);
  };

  const computeLiveMetrics = async () => {
    let dbOrders = (await getOrders().catch(() => [])) || [];
    if (!Array.isArray(dbOrders) || dbOrders.length === 0) {
      const stored = localStorage.getItem('orders');
      if (stored) {
        dbOrders = JSON.parse(stored);
      } else {
        dbOrders = MOCK_REPORTS_ORDERS;
      }
    }

    let filtered = dbOrders;

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
    const orderAmount = filtered.reduce((sum, o) => sum + (o.amount || 0), 0);

    filtered.forEach(o => {
      if (o.items) {
        const itemsList = o.items.split(',');
        const itemCount = itemsList.length;

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

          if (!productStatsMap[name]) {
            productStatsMap[name] = { name, quantity: 0, count: 0 };
          }
          productStatsMap[name].quantity += qty;
          productStatsMap[name].count += 1;

          let category = 'Other';
          const nameLower = name.toLowerCase();
          if (nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('lassi') || nameLower.includes('beverage') || nameLower.includes('soda')) {
            category = 'Beverages';
          } else if (nameLower.includes('cake') || nameLower.includes('ice cream') || nameLower.includes('kheer') || nameLower.includes('dessert')) {
            category = 'Desserts';
          } else if (nameLower.includes('samosa') || nameLower.includes('fries') || nameLower.includes('appetizer')) {
            category = 'Appetizers';
          } else if (nameLower.includes('rice') || nameLower.includes('biryani') || nameLower.includes('curry') || nameLower.includes('chicken') || nameLower.includes('paneer') || nameLower.includes('naan') || nameLower.includes('roti')) {
            category = 'Main Course';
          }

          if (!categoryStatsMap[category]) {
            categoryStatsMap[category] = { name: category, revenue: 0, orders: 0 };
          }
          categoryStatsMap[category].orders += 1;
        });
      }
    });

    // Allocate order amount proportionally across items for product revenue
    Object.keys(productStatsMap).forEach(name => {
      productStatsMap[name].revenue = orderAmount > 0
        ? parseFloat(((productStatsMap[name].count / filtered.length) * orderAmount / filtered.length).toFixed(2))
        : 0;
    });

    // Allocate revenue to categories proportionally
    const totalItemCount = Object.values(productStatsMap).reduce((s, p) => s + p.count, 0);
    Object.keys(categoryStatsMap).forEach(cat => {
      const categoryTotalCount = filtered.reduce((sum, o) => {
        if (!o.items) return sum;
        return sum + o.items.split(',').filter(item => {
          const nameLower = item.trim().toLowerCase();
          if (cat === 'Beverages') return nameLower.includes('tea') || nameLower.includes('coffee') || nameLower.includes('lassi') || nameLower.includes('soda');
          if (cat === 'Desserts') return nameLower.includes('cake') || nameLower.includes('ice cream') || nameLower.includes('kheer');
          if (cat === 'Appetizers') return nameLower.includes('samosa') || nameLower.includes('fries');
          if (cat === 'Main Course') return nameLower.includes('rice') || nameLower.includes('biryani') || nameLower.includes('curry') || nameLower.includes('chicken') || nameLower.includes('paneer') || nameLower.includes('naan');
          return false;
        }).length;
      }, 0);
      categoryStatsMap[cat].revenue = totalItemCount > 0 && orderAmount > 0
        ? parseFloat(((categoryTotalCount / totalItemCount) * orderAmount).toFixed(2))
        : 0;
    });

    const liveTopProducts = Object.values(productStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        ...p,
        percent: orderAmount > 0 ? parseFloat(((p.revenue / orderAmount) * 100).toFixed(1)) : 0
      }));
    setTopProducts(liveTopProducts);

    const liveTopCategories = Object.values(categoryStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map(c => ({
        ...c,
        percent: orderAmount > 0 ? parseFloat(((c.revenue / orderAmount) * 100).toFixed(1)) : 0
      }));
    setTopCategories(liveTopCategories);
    setChartData(filtered);
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
                max={todayStr}
                onChange={(e) => handleFromDateChange(e.target.value)}
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
                max={todayStr}
                onChange={(e) => handleToDateChange(e.target.value)}
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
                onChange={(e) => handleCustomerSearchChange(e.target.value)}
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

              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Orders</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                {liveStats.totalOrders.toLocaleString()}
              </h3>
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

              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Revenue</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                ₹{liveStats.totalRevenue.toLocaleString()}
              </h3>
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

              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Avg Order Value</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 4px 0' }}>
                ₹{liveStats.avgOrderValue.toLocaleString()}
              </h3>
            </div>

          </div>

          {/* Visual Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>

            {/* Sales Trend (SVG Gradient Graph) */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart3 size={16} style={{ color: 'var(--text-link)' }} />
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Sales Trend</span>
              </div>

              {(() => {
                const dataPoints = chartData.length > 0 ? chartData.slice(0, 10) : [];
                const maxAmount = Math.max(...dataPoints.map(o => o.amount || 0), 1);
                const chartW = 500;
                const chartH = 200;
                const points = dataPoints.map((o, i) => ({
                  x: ((i + 1) / (dataPoints.length + 1)) * chartW,
                  y: chartH - ((o.amount || 0) / maxAmount) * (chartH - 20) - 20,
                  label: o.dateTime ? new Date(o.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                }));
                const areaD = points.length > 0
                  ? `M ${points.map((p, i) => `${i === 0 ? '' : ''}${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`
                  : '';
                const lineD = points.length > 0
                  ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`
                  : '';
                return (
                  <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                    {dataPoints.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        No sales data yet
                      </div>
                    ) : (
                      <>
                        <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="100%" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--border-focus)" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="var(--border-focus)" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="0" y1="50" x2={chartW} y2="50" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                          <line x1="0" y1="100" x2={chartW} y2="100" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                          <line x1="0" y1="150" x2={chartW} y2="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />

                          {/* Area path */}
                          {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                          {/* Line stroke */}
                          {lineD && <path d={lineD} fill="none" stroke="var(--border-focus)" strokeWidth="3.5" strokeLinecap="round" />}

                          {/* Data points */}
                          {points.map((p, i) => (
                            <circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredPoint && hoveredPoint.x === p.x ? "7" : "5"}
                              fill="var(--bg-primary)"
                              stroke="var(--border-focus)"
                              strokeWidth="2.5"
                              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                              onMouseEnter={() => {
                                setHoveredPoint({
                                  x: p.x,
                                  y: p.y,
                                  label: p.label,
                                  amount: p.amount
                                });
                              }}
                              onMouseLeave={() => {
                                setHoveredPoint(null);
                              }}
                            />
                          ))}
                        </svg>

                        {/* X Axis Labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {points.map((p, i) => (
                            <span key={i}>{p.label}</span>
                          ))}
                        </div>

                        {/* Hover Tooltip */}
                        {hoveredPoint && (
                          <div style={{
                            position: 'absolute',
                            left: `${(hoveredPoint.x / chartW) * 100}%`,
                            top: `${(hoveredPoint.y / chartH) * 100 - 45}%`,
                            transform: 'translate(-50%, -100%)',
                            backgroundColor: 'rgba(30, 24, 20, 0.95)',
                            border: '1.5px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            color: '#fff',
                            fontSize: '11.5px',
                            pointerEvents: 'none',
                            zIndex: 10,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            <div style={{ fontWeight: '800', color: '#bfae9e' }}>Time: {hoveredPoint.label}</div>
                            <div style={{ fontSize: '13px', fontWeight: '850', color: '#10b981' }}>Revenue: ₹{hoveredPoint.amount}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
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
                <BarChart3 size={16} style={{ color: 'var(--text-link)' }} />
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Top Categories Distribution</span>
              </div>

              {topCategories.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', width: '100%' }}>
                  No data yet
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', height: '220px' }}>
                  {/* SVG Donut Chart wrapper for centering */}
                  <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="150" height="150" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                      {(() => {
                        const colors = ['#dfc2a5', '#bfae9e', '#8c7662', '#5c4d40', '#3d3228'];
                        let offset = 0;
                        return topCategories.slice(0, 5).map((c, i) => {
                          const dash = c.percent;
                          const gap = 100 - dash;
                          const isHovered = hoveredCategory && hoveredCategory.name === c.name;
                          const circle = (
                            <circle key={c.name}
                              cx="20" cy="20" r="15.915"
                              fill="transparent"
                              stroke={colors[i % colors.length]}
                              strokeWidth={isHovered ? "7.0" : "5.5"}
                              strokeDasharray={`${dash} ${gap}`}
                              strokeDashoffset={-offset}
                              style={{ cursor: 'pointer', transition: 'stroke-width 0.15s ease' }}
                              onMouseEnter={() => setHoveredCategory(c)}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          );
                          offset += dash;
                          return circle;
                        });
                      })()}
                      {/* Center cutout */}
                      <circle cx="20" cy="20" r="12" fill="var(--bg-card)" />
                    </svg>

                    {/* Centered details */}
                    <div style={{
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      width: '75px'
                    }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                        {hoveredCategory ? hoveredCategory.name : 'Total'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '850', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {hoveredCategory ? `${hoveredCategory.percent}%` : '100%'}
                      </span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const colors = ['#dfc2a5', '#bfae9e', '#8c7662', '#5c4d40', '#3d3228'];
                      return topCategories.slice(0, 5).map((c, i) => {
                        const isHovered = hoveredCategory && hoveredCategory.name === c.name;
                        return (
                          <div
                            key={c.name}
                            onMouseEnter={() => setHoveredCategory(c)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: isHovered ? 'var(--bg-button)' : 'transparent',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[i % colors.length] }} />
                            <span style={{ fontWeight: '700', color: isHovered ? 'var(--text-link)' : 'var(--text-primary)' }}>{c.name} ({c.percent}%)</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
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

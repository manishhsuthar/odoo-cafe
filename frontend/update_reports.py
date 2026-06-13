import re

file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/components/POSReports.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Update Imports
content = content.replace("import React from 'react';", "import React, { useState } from 'react';\nimport { Download, ChevronDown, TrendingUp, Receipt, BarChart3, Clock } from 'lucide-react';")

# 2. Add handlers and state
handlers = """  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

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

  const handleExportXLS = () => {
    let csvContent = "POS ANALYTICS REPORT\\r\\nGenerated At," + new Date().toLocaleString() + "\\r\\n\\r\\n";
    csvContent += "METRIC,VALUE\\r\\n";
    csvContent += `Gross Revenue,INR ${totalRevenue}\\r\\n`;
    csvContent += `Orders Handled,${totalOrdersCount}\\r\\n`;
    csvContent += `Average Ticket,INR ${aov}\\r\\n`;
    csvContent += `Outstanding Unpaid,INR ${unpaidRevenue}\\r\\n\\r\\n`;
    
    csvContent += "PAYMENT DISTRIBUTION\\r\\nMethod,Amount\\r\\n";
    Object.entries(paymentCounts).forEach(([method, amount]) => {
      csvContent += `${method === '-' ? 'Unpaid Settlement' : method},${amount}\\r\\n`;
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
"""

content = re.sub(
    r"// Calculate statistics.*?return acc;\n  \}, \{\}\);",
    handlers,
    content,
    flags=re.DOTALL
)


# 3. Fix header buttons
new_header_buttons = """        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
        </div>"""

content = re.sub(
    r"<button\s+onClick=\{reloadManagementData\}.*?Sync Data Log\s+</button>",
    new_header_buttons,
    content,
    flags=re.DOTALL
)

# 4. Fix Cards to remove colorful layout and add dark mode elegant styling
old_cards = r"""<div style={{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fit, minmax\(220px, 1fr\)\)', gap: '20px' }}>.*?</div>\s*</div>\s*\{/\* Payment Distribution"""

new_cards = """<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          
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

        {/* Payment Distribution"""

content = re.sub(old_cards, new_cards, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("Updates applied!")

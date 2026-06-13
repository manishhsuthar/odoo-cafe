import re
file_path = '/home/manish/Projects/odooo/frontend/src/pages/POS/components/POSReports.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# I will just write a new handleExportXLS function that generates proper strings
old_func = re.search(r"const handleExportXLS = \(\) => \{.*?setIsDownloadOpen\(false\);\n  \};", content, re.DOTALL)
if old_func:
    new_func = """const handleExportXLS = () => {
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
  };"""
    content = content.replace(old_func.group(0), new_func)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Not found")

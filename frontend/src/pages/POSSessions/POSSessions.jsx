import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { 
  Zap, 
  Search, 
  User, 
  Table as TableIcon, 
  CheckCircle, 
  CreditCard, 
  Trash2, 
  RefreshCw, 
  Download,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

const POSSessions = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Load logs
  const loadLogs = () => {
    const storedLogs = localStorage.getItem('pos_session_logs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch {
        setLogs([]);
      }
    } else {
      setLogs([]);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    let interval = null;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        loadLogs();
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all session logs?')) {
      localStorage.removeItem('pos_session_logs');
      setLogs([]);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No logs available to export.');
      return;
    }
    const headers = ['Time', 'Category', 'Type', 'Message'];
    const rows = logs.map(log => [
      log.time,
      log.category || 'General',
      log.type,
      log.message.replace(/"/g, '""')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pos_session_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine category for categorizing raw message imports
  const getLogCategory = (log) => {
    if (log.category) return log.category;
    const msg = log.message.toLowerCase();
    if (msg.includes('log') || msg.includes('user') || msg.includes('staff')) return 'Authentication';
    if (msg.includes('table') || msg.includes('reserve') || msg.includes('clear')) return 'Tables';
    if (msg.includes('order') || msg.includes('kitchen') || msg.includes('added item') || msg.includes('quantity')) return 'Orders';
    if (msg.includes('payment') || msg.includes('collect') || msg.includes('coupon') || msg.includes('bill')) return 'Payments';
    return 'General';
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const category = getLogCategory(log);
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = typeFilter === 'All' || category === typeFilter;
    return matchesSearch && matchesFilter;
  });

  // Analytics helper values
  const totalLogs = logs.length;
  const loginLogsCount = logs.filter(l => getLogCategory(l) === 'Authentication').length;
  const tableLogsCount = logs.filter(l => getLogCategory(l) === 'Tables').length;
  const paymentLogsCount = logs.filter(l => getLogCategory(l) === 'Payments').length;

  // Inline theme style helpers
  const pageStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    transition: 'background-color var(--transition-speed), color var(--transition-speed)'
  };

  const containerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  const mainStyle = {
    flex: 1,
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--card-shadow)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all var(--transition-speed)'
  };

  const tableHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap'
  };

  const filterRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  };

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: '1.5px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all var(--transition-speed)',
    minWidth: '200px'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-button)',
    color: 'var(--text-primary)',
    border: '1.5px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all var(--transition-speed)'
  };

  const dangerBtnStyle = {
    ...btnStyle,
    borderColor: '#ef4444',
    color: '#ef4444'
  };

  const consoleContainerStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--card-shadow)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const consoleHeaderStyle = {
    backgroundColor: 'var(--input-bg)',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logListStyle = {
    padding: '20px',
    maxHeight: '600px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontFamily: 'monospace',
    fontSize: '13.5px'
  };

  const logRowStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    lineHeight: '1.5'
  };

  const categoryBadgeStyle = (cat) => {
    let bg = 'rgba(255, 255, 255, 0.1)';
    let color = 'var(--text-secondary)';
    if (cat === 'Authentication') { bg = 'rgba(59, 130, 246, 0.15)'; color = '#3b82f6'; }
    if (cat === 'Tables') { bg = 'rgba(249, 115, 22, 0.15)'; color = '#f97316'; }
    if (cat === 'Orders') { bg = 'rgba(168, 85, 247, 0.15)'; color = '#a855f7'; }
    if (cat === 'Payments') { bg = 'rgba(16, 185, 129, 0.15)'; color = '#10b981'; }

    return {
      padding: '2px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '800',
      backgroundColor: bg,
      color: color,
      textTransform: 'uppercase'
    };
  };

  return (
    <div style={pageStyle}>
      <Sidebar />
      <div style={containerStyle}>
        <Header title="POS Sessions logs" />
        <main style={mainStyle}>
          
          {/* Analytics Cards */}
          <div style={gridStyle}>
            <div style={cardStyle}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(234, 88, 12, 0.15)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Session Logs</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0' }}>{totalLogs}</h3>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sign In / Shift Logs</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0' }}>{loginLogsCount}</h3>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TableIcon size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Table Bookings / Reservations</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0' }}>{tableLogsCount}</h3>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Payments Completed</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0' }}>{paymentLogsCount}</h3>
              </div>
            </div>
          </div>

          {/* Filtering bar */}
          <div style={tableHeaderStyle}>
            <div style={filterRowStyle}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All Categories</option>
                <option value="Authentication">Login & Shifts</option>
                <option value="Tables">Table Bookings & Layouts</option>
                <option value="Orders">Kitchen Orders Queue</option>
                <option value="Payments">Payments & Billing</option>
                <option value="System">System Diagnoses</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                style={{ ...btnStyle, borderColor: isAutoRefresh ? 'var(--border-focus)' : 'var(--border-color)' }}
              >
                {isAutoRefresh ? <Pause size={15} /> : <Play size={15} />}
                {isAutoRefresh ? 'Auto Syncing' : 'Sync Paused'}
              </button>

              <button onClick={loadLogs} style={btnStyle}>
                <RefreshCw size={15} />
                Refresh
              </button>

              <button onClick={handleExportCSV} style={btnStyle}>
                <Download size={15} />
                Export CSV
              </button>

              <button onClick={handleClearLogs} style={dangerBtnStyle}>
                <Trash2 size={15} />
                Clear
              </button>
            </div>
          </div>

          {/* Log display console container */}
          <div style={consoleContainerStyle}>
            <div style={consoleHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                  pos_session_log_feed.sh
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Showing {filteredLogs.length} of {totalLogs} events
              </span>
            </div>

            <div style={logListStyle}>
              {filteredLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={24} style={{ margin: '0 auto 10px', display: 'block', color: 'var(--text-secondary)' }} />
                  No session logs matched the search criteria.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const category = getLogCategory(log);
                  let badgeBg = 'var(--text-secondary)';
                  if (log.type === 'success') badgeBg = '#10b981';
                  if (log.type === 'warning') badgeBg = '#f97316';
                  if (log.type === 'danger') badgeBg = '#ef4444';

                  return (
                    <div key={log.id} style={logRowStyle}>
                      <span style={{ color: 'var(--text-link)', minWidth: '95px' }}>
                        [{log.time}]
                      </span>
                      <span style={categoryBadgeStyle(category)}>
                        {category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: badgeBg }} />
                      </div>
                      <span style={{ 
                        color: log.type === 'danger' ? '#ef4444' : log.type === 'success' ? '#10b981' : 'var(--text-primary)',
                        textAlign: 'left'
                      }}>
                        {log.message}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default POSSessions;

import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { Layers, CalendarClock, User, Check, X, LogIn, RefreshCcw } from 'lucide-react';

const DEFAULT_TABLES = [
  // First Floor Tables
  { id: 'f1', name: 'f1', floor: 1, status: 'free', customerName: '' },
  { id: 'f2', name: 'f2', floor: 1, status: 'occupied', customerName: '' },
  { id: 'f3', name: 'f3', floor: 1, status: 'free', customerName: '' },
  { id: 'f4', name: 'f4', floor: 1, status: 'reserved', customerName: 'Jane Smith' },
  { id: 'f5', name: 'f5', floor: 1, status: 'free', customerName: '' },
  { id: 'f6', name: 'f6', floor: 1, status: 'occupied', customerName: '' },
  { id: 'f7', name: 'f7', floor: 1, status: 'free', customerName: '' },
  { id: 'f8', name: 'f8', floor: 1, status: 'free', customerName: '' },
  { id: 'f9', name: 'f9', floor: 1, status: 'reserved', customerName: 'Alex Green' },
  { id: 'f10', name: 'f10', floor: 1, status: 'free', customerName: '' },
  
  // Second Floor Tables
  { id: 's1', name: 's1', floor: 2, status: 'free', customerName: '' },
  { id: 's2', name: 's2', floor: 2, status: 'free', customerName: '' },
  { id: 's3', name: 's3', floor: 2, status: 'occupied', customerName: '' },
  { id: 's4', name: 's4', floor: 2, status: 'free', customerName: '' },
  { id: 's5', name: 's5', floor: 2, status: 'reserved', customerName: 'David Miller' },
  { id: 's6', name: 's6', floor: 2, status: 'free', customerName: '' },
  { id: 's7', name: 's7', floor: 2, status: 'free', customerName: '' },
  { id: 's8', name: 's8', floor: 2, status: 'occupied', customerName: '' },
  { id: 's9', name: 's9', floor: 2, status: 'free', customerName: '' },
  { id: 's10', name: 's10', floor: 2, status: 'free', customerName: '' },
];

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [activeFloor, setActiveFloor] = useState(1); // 1 = First Floor, 2 = Second Floor
  
  // Modal State
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerInput, setCustomerInput] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = () => {
    const stored = localStorage.getItem('floor_plan_tables');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 20) {
          setTables(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse floor plan tables', e);
      }
    }
    // Seed/Reset if not 20 tables
    localStorage.setItem('floor_plan_tables', JSON.stringify(DEFAULT_TABLES));
    setTables(DEFAULT_TABLES);
  };

  const saveTablesState = (updatedTables) => {
    localStorage.setItem('floor_plan_tables', JSON.stringify(updatedTables));
    setTables(updatedTables);
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setCustomerInput(table.customerName || '');
  };

  const addSessionLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = { id: `log_${Date.now()}_${Math.random()}`, time, message, type };
    try {
      const stored = localStorage.getItem('pos_session_logs');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newLog, ...list].slice(0, 100);
      localStorage.setItem('pos_session_logs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReserve = (e) => {
    e.preventDefault();
    if (!customerInput.trim()) {
      alert('Please enter customer name to reserve.');
      return;
    }

    const updated = tables.map(t => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          status: 'reserved',
          customerName: customerInput.trim()
        };
      }
      return t;
    });

    addSessionLog(`Table ${selectedTable.name.toUpperCase()} reserved for ${customerInput.trim()}`, 'warning');
    saveTablesState(updated);
    setSelectedTable(null);
    setCustomerInput('');
  };

  const handleMarkOccupied = () => {
    const updated = tables.map(t => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          status: 'occupied',
          customerName: ''
        };
      }
      return t;
    });

    addSessionLog(`Table ${selectedTable.name.toUpperCase()} occupied`, 'danger');
    saveTablesState(updated);
    setSelectedTable(null);
  };

  const handleClearTable = () => {
    const updated = tables.map(t => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          status: 'free',
          customerName: ''
        };
      }
      return t;
    });

    addSessionLog(`Table ${selectedTable.name.toUpperCase()} cleared (free)`, 'success');
    saveTablesState(updated);
    setSelectedTable(null);
  };

  const resetAllTables = () => {
    if (window.confirm('Reset all table statuses back to defaults?')) {
      localStorage.setItem('floor_plan_tables', JSON.stringify(DEFAULT_TABLES));
      setTables(DEFAULT_TABLES);
      addSessionLog('All floor plan table statuses reset to default', 'info');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return '#ef4444'; // Red
      case 'reserved': return '#f97316'; // Orange
      case 'free': default: return '#10b981'; // Green
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'occupied': return 'Occupied';
      case 'reserved': return 'Reserved';
      case 'free': default: return 'Free / Open';
    }
  };

  const floorTables = tables.filter(t => t.floor === activeFloor);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Tables Layout" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Interactive Floor Plan</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Click free tables to reserve or clear occupied tables dynamically.</p>
            </div>
            
            <button 
              onClick={resetAllTables}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-button)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
            >
              <RefreshCcw size={14} />
              Reset Plan
            </button>
          </div>

          {/* Floor Navigation & Status Legend bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--input-bg)', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveFloor(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: activeFloor === 1 ? 'var(--border-focus)' : 'transparent',
                  color: activeFloor === 1 ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                <Layers size={14} />
                First Floor (f1 - f10)
              </button>
              <button
                onClick={() => setActiveFloor(2)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: activeFloor === 2 ? 'var(--border-focus)' : 'transparent',
                  color: activeFloor === 2 ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                <Layers size={14} />
                Second Floor (s1 - s10)
              </button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: '700' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Free</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: '700' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Reserved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: '700' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Occupied</span>
              </div>
            </div>
          </div>

          {/* Grid Layout of Tables */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '12px'
          }}>
            {floorTables.map((table) => {
              const borderCol = getStatusColor(table.status);
              
              return (
                <div 
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: `2px solid ${borderCol}`,
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'all 0.25s ease',
                    minHeight: '200px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 10px 20px ${borderCol}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                  }}
                >
                  {/* Dining chairs illustration around the table card */}
                  <div style={{
                    position: 'absolute',
                    width: '75px',
                    height: '75px',
                    borderRadius: '50%',
                    border: `1.5px dashed ${borderCol}aa`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {/* Visual Round Table representation */}
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: `${borderCol}1a`,
                      border: `1.5px solid ${borderCol}`,
                    }} />
                  </div>

                  {/* Table identifier label */}
                  <div style={{ marginTop: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                      Table {table.name}
                    </span>
                    
                    {/* Status Badge */}
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      backgroundColor: `${borderCol}18`,
                      color: borderCol
                    }}>
                      {getStatusLabel(table.status)}
                    </span>
                    
                    {table.status === 'reserved' && table.customerName && (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '6px' }}>
                        👤 {table.customerName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* --- DETAILS & RESERVATION MODAL --- */}
      {selectedTable && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <div style={{
            width: '400px',
            backgroundColor: 'var(--bg-card)',
            border: `2px solid ${getStatusColor(selectedTable.status)}`,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 className="handwritten" style={{ margin: 0, fontSize: '22px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Table {selectedTable.name} Details
              </h3>
              <button 
                onClick={() => setSelectedTable(null)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
              >
                X
              </button>
            </div>

            {/* Table Details status info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Floor:</span>
                <strong>{selectedTable.floor === 1 ? '1st Floor' : '2nd Floor'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <strong style={{ color: getStatusColor(selectedTable.status) }}>
                  {getStatusLabel(selectedTable.status)}
                </strong>
              </div>
              {selectedTable.status === 'reserved' && selectedTable.customerName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
                  <strong>{selectedTable.customerName}</strong>
                </div>
              )}
            </div>

            {/* Contextual Action options */}
            {selectedTable.status === 'free' && (
              <form onSubmit={handleReserve} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Reserve for Customer:</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer name..."
                    value={customerInput}
                    onChange={(e) => setCustomerInput(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '14.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <CalendarClock size={16} />
                  Book / Reserve Table
                </button>
              </form>
            )}

            {selectedTable.status === 'reserved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={handleMarkOccupied}
                  style={{
                    width: '100%',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LogIn size={15} />
                  Mark as Occupied (Customer Seated)
                </button>
                <button
                  onClick={handleClearTable}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: '1.5px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '10px',
                    padding: '11px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={15} />
                  Release Reservation (Make Free)
                </button>
              </div>
            )}

            {selectedTable.status === 'occupied' && (
              <button
                onClick={handleClearTable}
                style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <Check size={16} />
                Clear Table (Customer Departed)
              </button>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => setSelectedTable(null)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-button)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tables;

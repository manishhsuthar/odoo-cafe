import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { Layers, CalendarClock, User, Check, X, LogIn, RefreshCcw } from 'lucide-react';
import { getTables, updateTable } from '../../utils/db';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [activeFloor, setActiveFloor] = useState(1); // 1 = First Floor, 2 = Second Floor
  
  // Modal State
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerInput, setCustomerInput] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await getTables();
      if (Array.isArray(data)) {
        const mapped = data.map(t => ({
          id: t.id,
          name: t.name,
          floor: t.floor || 1,
          status: t.status || 'free',
          customerName: t.customerName || '',
        }));
        setTables(mapped);
      }
    } catch {
      setTables([]);
    }
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

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!customerInput.trim()) {
      alert('Please enter customer name to reserve.');
      return;
    }

    try {
      await updateTable(selectedTable.id, {
        floor: selectedTable.floor,
        name: selectedTable.name,
        status: 'reserved',
        customer_name: customerInput.trim()
      });
      addSessionLog(`Table ${selectedTable.name.toUpperCase()} reserved for ${customerInput.trim()}`, 'warning');
      await loadTables();
      setSelectedTable(null);
      setCustomerInput('');
    } catch (err) {
      console.error(err);
      alert('Failed to reserve table');
    }
  };

  const handleMarkOccupied = async () => {
    try {
      await updateTable(selectedTable.id, {
        floor: selectedTable.floor,
        name: selectedTable.name,
        status: 'occupied',
        customer_name: ''
      });
      addSessionLog(`Table ${selectedTable.name.toUpperCase()} occupied`, 'danger');
      await loadTables();
      setSelectedTable(null);
    } catch (err) {
      console.error(err);
      alert('Failed to mark table occupied');
    }
  };

  const handleClearTable = async () => {
    try {
      await updateTable(selectedTable.id, {
        floor: selectedTable.floor,
        name: selectedTable.name,
        status: 'free',
        customer_name: ''
      });
      addSessionLog(`Table ${selectedTable.name.toUpperCase()} cleared (free)`, 'success');
      await loadTables();
      setSelectedTable(null);
    } catch (err) {
      console.error(err);
      alert('Failed to clear table');
    }
  };

  const resetAllTables = async () => {
    if (window.confirm('Reset all table statuses to free?')) {
      try {
        await Promise.all(tables.map(t => 
          updateTable(t.id, {
            floor: t.floor,
            name: t.name,
            status: 'free',
            customer_name: ''
          })
        ));
        addSessionLog('All table statuses reset to free', 'info');
        await loadTables();
      } catch (err) {
        console.error(err);
        alert('Failed to reset all tables');
      }
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

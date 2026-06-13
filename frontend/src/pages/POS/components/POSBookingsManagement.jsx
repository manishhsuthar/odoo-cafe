import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSBookingsManagement = ({
  bookingsList,
  setBookingsList,
  addLogEntry,
  tablesList
}) => {
  const [searchBookingsQuery, setSearchBookingsQuery] = useState('');
  const [newBookingCustomer, setNewBookingCustomer] = useState('');
  const [newBookingPhone, setNewBookingPhone] = useState('');
  const [newBookingDateTime, setNewBookingDateTime] = useState('');
  const [newBookingGuests, setNewBookingGuests] = useState('2');
  const [newBookingTable, setNewBookingTable] = useState('');

  const handleAddBooking = (e) => {
    e.preventDefault();
    if (!newBookingCustomer || !newBookingPhone || !newBookingDateTime) return;
    const newBK = {
      id: `bk_${Date.now()}`,
      customerName: newBookingCustomer,
      phone: newBookingPhone,
      dateTime: newBookingDateTime,
      guests: parseInt(newBookingGuests || 2),
      table: newBookingTable || 'Unassigned',
      status: 'Pending'
    };
    const updated = [...bookingsList, newBK];
    localStorage.setItem('pos_bookings', JSON.stringify(updated));
    setBookingsList(updated);
    setNewBookingCustomer('');
    setNewBookingPhone('');
    setNewBookingDateTime('');
    setNewBookingTable('');
    addLogEntry(`Booked table for customer: ${newBK.customerName}`, 'success');
    alert('Table booking added successfully!');
  };

  const handleUpdateBookingStatus = (bkId, status) => {
    const updated = bookingsList.map(bk => {
      if (bk.id === bkId) {
        addLogEntry(`Booking for ${bk.customerName} set to ${status}`, 'info');
        return { ...bk, status };
      }
      return bk;
    });
    localStorage.setItem('pos_bookings', JSON.stringify(updated));
    setBookingsList(updated);
  };

  const handleDeleteBooking = (bkId) => {
    if (window.confirm('Are you sure you want to delete this booking reservation?')) {
      const bk = bookingsList.find(b => b.id === bkId);
      const updated = bookingsList.filter(b => b.id !== bkId);
      localStorage.setItem('pos_bookings', JSON.stringify(updated));
      setBookingsList(updated);
      if (bk) addLogEntry(`Deleted booking for ${bk.customerName}`, 'danger');
    }
  };

  return (
    <div style={bodyOrdersStyle}>
      {/* Bookings & Reservations Page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>POS Bookings & Reservations</h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--input-bg)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '20px',
          padding: '10px 18px',
          width: '450px',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search bookings by customer name..."
            value={searchBookingsQuery}
            onChange={(e) => setSearchBookingsQuery(e.target.value)}
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
          <Search size={18} color="var(--text-secondary)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', alignItems: 'start' }}>

        {/* Left Column: Add Booking Form */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--card-shadow)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-standard)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '10px', textAlign: 'left' }}>
            Reserve a Table
          </h3>
          <form onSubmit={handleAddBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newBookingCustomer}
                onChange={(e) => setNewBookingCustomer(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Contact Phone *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98765 43210"
                value={newBookingPhone}
                onChange={(e) => setNewBookingPhone(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={newBookingDateTime}
                onChange={(e) => setNewBookingDateTime(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Guests count</label>
                <input
                  type="number"
                  min="1"
                  value={newBookingGuests}
                  onChange={(e) => setNewBookingGuests(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Table Select</label>
                <select
                  value={newBookingTable}
                  onChange={(e) => setNewBookingTable(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Unassigned</option>
                  {tablesList.map(t => (
                    <option key={t.id} value={t.name}>{t.name} (Floor {t.floor})</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--border-focus)',
                color: 'var(--bg-primary)',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '10px',
                textAlign: 'center'
              }}
            >
              Confirm Booking
            </button>
          </form>
        </div>

        {/* Right Column: Bookings List */}
        <div style={{
          flex: 2,
          backgroundColor: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: 'var(--card-shadow)',
          color: 'var(--text-primary)',
          transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Active Reservations</h3>
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchBookingsQuery}
              onChange={(e) => setSearchBookingsQuery(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Table (Guests)</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = bookingsList.filter(bk =>
                    (bk.customerName || '').toLowerCase().includes(searchBookingsQuery.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No reservations booked.
                        </td>
                      </tr>
                    );
                  }
                  return filtered.map(bk => (
                    <tr key={bk.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>{bk.customerName}</td>
                      <td style={tdStyle}>{bk.phone}</td>
                      <td style={tdStyle}>{new Date(bk.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td style={{ ...tdStyle, fontWeight: '650' }}>{bk.table} ({bk.guests} Guests)</td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor:
                            bk.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.1)' :
                              bk.status === 'Pending' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color:
                            bk.status === 'Confirmed' ? '#10b981' :
                              bk.status === 'Pending' ? '#ea580c' : '#ef4444'
                        }}>
                          {bk.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          {bk.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(bk.id, 'Confirmed')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              Accept
                            </button>
                          )}
                          {bk.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(bk.id, 'Cancelled')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBooking(bk.id)}
                            style={{
                              padding: '4px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSBookingsManagement;

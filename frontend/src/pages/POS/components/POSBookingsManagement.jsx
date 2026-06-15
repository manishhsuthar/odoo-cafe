import React, { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  checkInReservation,
  cancelReservation,
  getTables,
  getCustomers,
  addCustomer
} from '../../../utils/db';

const POSBookingsManagement = ({
  addLogEntry
}) => {
  const [searchBookingsQuery, setSearchBookingsQuery] = useState('');
  const [newBookingCustomer, setNewBookingCustomer] = useState('');
  const [newBookingPhone, setNewBookingPhone] = useState('');
  const [newBookingDateTime, setNewBookingDateTime] = useState('');
  const [newBookingGuests, setNewBookingGuests] = useState('2');
  const [newBookingTable, setNewBookingTable] = useState('');
  const [backendBookings, setBackendBookings] = useState([]);
  const [backendTables, setBackendTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [resList, tabList] = await Promise.all([
        getReservations().catch(() => []),
        getTables().catch(() => [])
      ]);
      setBackendBookings(Array.isArray(resList) ? resList : []);
      setBackendTables(Array.isArray(tabList) ? tabList : []);
    } catch (err) {
      console.error("Failed to fetch reservations/tables from backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!newBookingCustomer || !newBookingPhone || !newBookingDateTime || !newBookingTable) {
      alert('Please fill out all required fields, including selecting a table.');
      return;
    }

    const nameTrimmed = newBookingCustomer.trim();
    if (!/^[a-zA-Z\s]+$/.test(nameTrimmed)) {
      alert('Customer name must contain only letters and spaces.');
      return;
    }

    const phoneTrimmed = newBookingPhone.trim();
    if (!/^\d{10}$/.test(phoneTrimmed)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    const guestsString = String(newBookingGuests).trim();
    if (!/^\d+$/.test(guestsString) || parseInt(guestsString, 10) < 1) {
      alert('Guest count must be a positive integer.');
      return;
    }

    try {
      // 1. Find or create Customer in backend
      const customers = await getCustomers().catch(() => []);
      let targetCustomer = customers.find(c => c.phone === phoneTrimmed);
      if (!targetCustomer) {
        targetCustomer = await addCustomer({
          name: nameTrimmed,
          phone: phoneTrimmed,
          email: `${nameTrimmed.toLowerCase().replace(/\s+/g, '')}@example.com`,
          spend: 0,
          orders_count: 0
        });
      }

      // 2. Parse Date and Time
      const [datePart, timePart] = newBookingDateTime.split('T');
      const reservationDate = datePart;
      const reservationTime = timePart ? (timePart.length === 5 ? `${timePart}:00` : timePart) : "12:00:00";

      // 3. Create Reservation in backend
      await createReservation({
        customer: targetCustomer.id,
        table: parseInt(newBookingTable, 10),
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        party_size: parseInt(guestsString, 10),
        notes: "POS Booked Entry"
      });

      addLogEntry(`Created reservation for customer: ${nameTrimmed}`, 'success');
      alert('Reservation booked successfully!');
      
      // Clear inputs
      setNewBookingCustomer('');
      setNewBookingPhone('');
      setNewBookingDateTime('');
      setNewBookingTable('');
      
      // Refresh list
      loadAllData();
    } catch (err) {
      console.error(err);
      const responseData = err.response?.data;
      let errMsg = 'Failed to book table.';
      if (responseData) {
        if (responseData.non_field_errors) {
          errMsg = responseData.non_field_errors.join(' ');
        } else if (responseData.error) {
          errMsg = responseData.error;
        } else {
          errMsg = JSON.stringify(responseData);
        }
      }
      alert(errMsg);
    }
  };

  const handleUpdateBookingStatus = async (bkId, newStatus) => {
    try {
      const statusLower = newStatus.toLowerCase();
      let updatedBooking;
      if (statusLower === 'completed') {
        updatedBooking = await checkInReservation(bkId);
      } else if (statusLower === 'cancelled') {
        updatedBooking = await cancelReservation(bkId);
      } else {
        updatedBooking = await updateReservation(bkId, { status: statusLower });
      }

      addLogEntry(`Reservation for ${updatedBooking.customerName || 'customer'} set to ${newStatus}`, 'info');
      loadAllData();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to update reservation status.';
      alert(errMsg);
    }
  };

  const handleDeleteBooking = async (bkId) => {
    if (window.confirm('Are you sure you want to delete this booking reservation?')) {
      try {
        await deleteReservation(bkId);
        addLogEntry(`Deleted reservation ID: ${bkId}`, 'danger');
        loadAllData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete reservation.');
      }
    }
  };

  // Helper to get formatted status color
  const getStatusColorStyles = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'confirmed':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Confirmed' };
      case 'pending':
        return { bg: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', label: 'Pending' };
      case 'completed':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Completed' };
      case 'cancelled':
      default:
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: status || 'Cancelled' };
    }
  };

  const filtered = backendBookings.filter(bk =>
    (bk.customerName || '').toLowerCase().includes(searchBookingsQuery.toLowerCase())
  );

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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                placeholder="e.g. 9876543210"
                value={newBookingPhone}
                onChange={(e) => setNewBookingPhone(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
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
                <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Table Select *</label>
                <select
                  value={newBookingTable}
                  onChange={(e) => setNewBookingTable(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Table</option>
                  {backendTables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Floor {t.floorName || t.floor})</option>
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
                {isLoading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Loading reservations...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No reservations booked.
                    </td>
                  </tr>
                ) : (
                  filtered.map(bk => {
                    const statusStyle = getStatusColorStyles(bk.status);
                    let displayDateTime = '';
                    try {
                      if (bk.reservationDate && bk.reservationTime) {
                        displayDateTime = new Date(`${bk.reservationDate}T${bk.reservationTime}`).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        });
                      }
                    } catch (e) {
                      displayDateTime = `${bk.reservationDate} ${bk.reservationTime}`;
                    }

                    return (
                      <tr key={bk.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>{bk.customerName}</td>
                        <td style={tdStyle}>{bk.customerPhone}</td>
                        <td style={tdStyle}>{displayDateTime}</td>
                        <td style={{ ...tdStyle, fontWeight: '650' }}>Table {bk.tableNumber} ({bk.partySize} Guests)</td>
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            {bk.status !== 'confirmed' && bk.status !== 'completed' && bk.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, 'confirmed')}
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
                            {bk.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                  color: '#3b82f6',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                Check In
                              </button>
                            )}
                            {bk.status !== 'cancelled' && bk.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSBookingsManagement;

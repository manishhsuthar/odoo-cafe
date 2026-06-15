import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { Search, Plus, Calendar, Check, X, Trash2, CalendarClock, User, LogIn } from 'lucide-react';
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
} from '../../utils/db';

const TableBooking = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDateTime, setFormDateTime] = useState('');
  const [formGuests, setFormGuests] = useState('2');
  const [formTable, setFormTable] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resList, tabList, custList] = await Promise.all([
        getReservations().catch(() => []),
        getTables().catch(() => []),
        getCustomers().catch(() => [])
      ]);
      setReservations(Array.isArray(resList) ? resList : []);
      setTables(Array.isArray(tabList) ? tabList : []);
      setCustomers(Array.isArray(custList) ? custList : []);
    } catch (err) {
      console.error('Failed to load reservations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormPhone('');
    setFormDateTime('');
    setFormGuests('2');
    setFormTable('');
    setFormNotes('');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formName.trim()) newErrors.name = 'Customer name is required';
    if (!formPhone.trim() || !/^\d{10}$/.test(formPhone.trim())) newErrors.phone = 'Phone number must be exactly 10 digits';
    if (!formDateTime) newErrors.dateTime = 'Reservation date and time is required';
    if (!formTable) newErrors.table = 'Table assignment is required';
    
    const guestNum = parseInt(formGuests, 10);
    if (isNaN(guestNum) || guestNum < 1) {
      newErrors.guests = 'Guests count must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 1. Get or Create Customer
      const phoneTrimmed = formPhone.trim();
      const nameTrimmed = formName.trim();
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
      const [datePart, timePart] = formDateTime.split('T');
      const reservationTime = timePart ? (timePart.length === 5 ? `${timePart}:00` : timePart) : '12:00:00';

      // 3. Create Reservation
      await createReservation({
        customer: targetCustomer.id,
        table: parseInt(formTable, 10),
        reservation_date: datePart,
        reservation_time: reservationTime,
        party_size: guestNum,
        notes: formNotes.trim()
      });

      alert('Reservation added successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const responseData = err.response?.data;
      let errMsg = 'Failed to create reservation.';
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const statusLower = newStatus.toLowerCase();
      if (statusLower === 'completed') {
        await checkInReservation(id);
      } else if (statusLower === 'cancelled') {
        await cancelReservation(id);
      } else {
        await updateReservation(id, { status: statusLower });
      }
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update reservation status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation permanently?')) {
      try {
        await deleteReservation(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete reservation.');
      }
    }
  };

  // Status style helper
  const getStatusBadge = (status) => {
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

  // Filters
  const filteredReservations = reservations
    .filter(res => {
      const nameMatch = (res.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (res.customerPhone || '').includes(searchQuery);
      const statusMatch = statusFilter === 'all' || (res.status || '').toLowerCase() === statusFilter.toLowerCase();
      return nameMatch && statusMatch;
    });

  // Calculate Metrics
  const totalBookings = reservations.length;
  const pendingBookings = reservations.filter(r => (r.status || '').toLowerCase() === 'pending').length;
  const confirmedBookings = reservations.filter(r => (r.status || '').toLowerCase() === 'confirmed').length;
  const completedBookings = reservations.filter(r => (r.status || '').toLowerCase() === 'completed').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Table Bookings" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Table Bookings & Reservations</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Monitor table bookings, status check-ins, and floor-plan reservations.</p>
            </div>
            
            <button
              onClick={openAddModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--border-focus)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: 'var(--card-shadow)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <Plus size={16} strokeWidth={3} />
              <span>Book Table</span>
            </button>
          </div>

          {/* Metrics summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Total */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(191, 174, 158, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-link)', marginBottom: '12px' }}>
                <Calendar size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Total Bookings</div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{totalBookings}</h3>
            </div>
            
            {/* Pending */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(234, 88, 12, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', marginBottom: '12px' }}>
                <CalendarClock size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Pending Requests</div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{pendingBookings}</h3>
            </div>

            {/* Confirmed */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '12px' }}>
                <Check size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Confirmed Tables</div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{confirmedBookings}</h3>
            </div>

            {/* Completed */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '12px' }}>
                <LogIn size={18} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Seated & Completed</div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0' }}>{completedBookings}</h3>
            </div>
          </div>

          {/* Filtering bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-primary)', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', flex: 1, minWidth: '280px' }}>
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '14px', width: '100%', fontWeight: '600' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                <option value="all">All Booking States</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings table */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Customer</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Phone Number</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Date & Time</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Seating (Table)</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'center' }}>Party Size</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map(res => {
                    const statusBadge = getStatusBadge(res.status);
                    let displayTime = '';
                    try {
                      displayTime = new Date(`${res.reservationDate}T${res.reservationTime}`).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      });
                    } catch {
                      displayTime = `${res.reservationDate} ${res.reservationTime}`;
                    }

                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {res.customerName}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {res.customerPhone}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {displayTime}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: '700' }}>
                          Table {res.tableNumber} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({res.floorName})</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14.5px', fontWeight: '750', textAlign: 'center' }}>
                          {res.partySize}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', backgroundColor: statusBadge.bg, color: statusBadge.color }}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {res.status !== 'confirmed' && res.status !== 'completed' && res.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(res.id, 'confirmed')}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                              >
                                Confirm
                              </button>
                            )}
                            {res.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(res.id, 'completed')}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                              >
                                Check In
                              </button>
                            )}
                            {res.status !== 'cancelled' && res.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(res.id, 'cancelled')}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(res.id)}
                              style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={14} />
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
        </main>
      </div>

      {/* Book table Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: '20px', width: '90%', maxWidth: '480px', boxShadow: 'var(--card-shadow)', padding: '28px', position: 'relative', textAlign: 'left', boxSizing: 'border-box' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            <h3 className="handwritten" style={{ fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
              Book a New Table
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: errors.name ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                />
                {errors.name && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.name}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Contact Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: errors.phone ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontWeight: '600' }}
                />
                {errors.phone && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.phone}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formDateTime}
                  onChange={(e) => setFormDateTime(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: errors.dateTime ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', cursor: 'pointer' }}
                />
                {errors.dateTime && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.dateTime}</span>}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Guests *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formGuests}
                    onChange={(e) => setFormGuests(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: errors.guests ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
                  />
                  {errors.guests && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.guests}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Assign Table *</label>
                  <select
                    required
                    value={formTable}
                    onChange={(e) => setFormTable(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: errors.table ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', cursor: 'pointer' }}
                  >
                    <option value="">Select Table</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Floor {t.floorName || t.floor})</option>
                    ))}
                  </select>
                  {errors.table && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.table}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>Booking Notes</label>
                <textarea
                  placeholder="Any special requests or allergies..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontWeight: '750', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--border-focus)', color: 'var(--bg-primary)', fontWeight: '800', cursor: 'pointer' }}>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableBooking;

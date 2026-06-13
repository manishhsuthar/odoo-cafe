import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const TableBooking = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Table Booking" />
        <main style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)' }}>Table Booking & Reservations</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Manage customer table reservations, event bookings, and seating assignments.</p>
        </main>
      </div>
    </div>
  );
};

export default TableBooking;

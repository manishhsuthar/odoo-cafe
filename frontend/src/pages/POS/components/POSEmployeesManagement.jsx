import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { bodyOrdersStyle, thStyle, tdStyle } from './POSSharedStyles';

const POSEmployeesManagement = ({
  allEmployeesList,
  setAllEmployeesList,
  attendanceLogsList,
  setAttendanceLogsList,
  addLogEntry
}) => {
  const [searchEmployeesQuery, setSearchEmployeesQuery] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Chef');
  const [newEmpPassword, setNewEmpPassword] = useState('');

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpPassword) return;
    const newEmp = {
      id: `emp_${Date.now()}`,
      name: newEmpName,
      email: newEmpEmail,
      role: newEmpRole,
      password: newEmpPassword
    };
    const updated = [...allEmployeesList, newEmp];
    localStorage.setItem('employees', JSON.stringify(updated));
    setAllEmployeesList(updated);
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpPassword('');
    addLogEntry(`Added employee: ${newEmp.name} (${newEmp.role})`, 'success');
    alert('Employee registered successfully!');
  };

  const handleDeleteEmployee = (empId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const emp = allEmployeesList.find(e => e.id === empId);
      const updated = allEmployeesList.filter(e => e.id !== empId);
      localStorage.setItem('employees', JSON.stringify(updated));
      setAllEmployeesList(updated);
      if (emp) addLogEntry(`Deleted employee ${emp.name}`, 'danger');
    }
  };

  const handleToggleShift = (logId) => {
    const updated = attendanceLogsList.map(log => {
      if (log.id === logId) {
        const isCurrentlyActive = !log.logoutTime;
        return {
          ...log,
          logoutTime: isCurrentlyActive ? new Date().toISOString() : null
        };
      }
      return log;
    });
    localStorage.setItem('employee_logs', JSON.stringify(updated));
    setAttendanceLogsList(updated);
    addLogEntry(`Toggled shift status for log ID ${logId}`, 'info');
  };

  return (
    <div style={bodyOrdersStyle}>
      {/* Employees Management Page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Staff Attendance & Employees Directory</h2>
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
            placeholder="Search staff members..."
            value={searchEmployeesQuery}
            onChange={(e) => setSearchEmployeesQuery(e.target.value)}
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

        {/* Left Column: Register Employee */}
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
            Register New Staff
          </h3>
          <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Employee Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={newEmpName}
                onChange={(e) => setNewEmpName(e.target.value)}
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
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. ramesh@cafe.com"
                value={newEmpEmail}
                onChange={(e) => setNewEmpEmail(e.target.value)}
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
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Designated Role *</label>
              <select
                value={newEmpRole}
                onChange={(e) => setNewEmpRole(e.target.value)}
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
                <option value="Chef">Chef</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-secondary)' }}>Access Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newEmpPassword}
                onChange={(e) => setNewEmpPassword(e.target.value)}
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
              Register Employee
            </button>
          </form>
        </div>

        {/* Right Column: Employees Directory & Shift Attendance Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* Employees Directory Table */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            color: 'var(--text-primary)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border-color)', fontSize: '16px', fontWeight: '800', textAlign: 'left' }}>
              Staff Members Directory
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={thStyle}>Staff Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role Badge</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = allEmployeesList.filter(emp =>
                    (emp.name || '').toLowerCase().includes(searchEmployeesQuery.toLowerCase()) ||
                    (emp.role || '').toLowerCase().includes(searchEmployeesQuery.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No employees matched query.
                        </td>
                      </tr>
                    );
                  }
                  return filtered.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>{emp.name}</td>
                      <td style={tdStyle}>{emp.email}</td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          backgroundColor:
                            emp.role === 'Manager' ? 'rgba(239, 68, 68, 0.15)' :
                              emp.role === 'Chef' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                          color:
                            emp.role === 'Manager' ? '#ef4444' :
                              emp.role === 'Chef' ? '#ea580c' : '#2563eb'
                        }}>
                          {emp.role}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Shift Attendance Log Table */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
            color: 'var(--text-primary)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--border-color)', fontSize: '16px', fontWeight: '800', textAlign: 'left' }}>
              Shift Attendance Logs
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={thStyle}>Staff Employee</th>
                  <th style={thStyle}>Clock In Time</th>
                  <th style={thStyle}>Clock Out Time</th>
                  <th style={thStyle}>Duty Status</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Shift Management</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No attendance logs stored in history.
                    </td>
                  </tr>
                ) : (
                  attendanceLogsList.slice(0, 10).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>
                        <div>{log.employeeName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{log.employeeEmail}</div>
                      </td>
                      <td style={tdStyle}>{new Date(log.loginTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td style={tdStyle}>
                        {log.logoutTime ? new Date(log.logoutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: log.logoutTime ? 'rgba(255, 255, 255, 0.08)' : 'rgba(16, 185, 129, 0.15)',
                          color: log.logoutTime ? 'var(--text-secondary)' : '#10b981'
                        }}>
                          {log.logoutTime ? 'Completed' : 'On Duty'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleShift(log.id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            border: '1.5px solid var(--border-color)',
                            backgroundColor: 'var(--bg-button)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {log.logoutTime ? 'Reopen Shift' : 'End Duty Shift'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSEmployeesManagement;

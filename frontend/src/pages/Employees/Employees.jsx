import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Table from '../../components/ui/Table';
import { Trash2, Search, Clock, LogIn, LogOut, ShieldAlert, X } from 'lucide-react';
import { getEmployees, getEmployeeLogs, saveEmployeeLogs, addEmployee } from '../../utils/db';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal & form states for adding new employees
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('chef');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const emps = await getEmployees();
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (err) {
      console.error(err);
      setEmployees([]);
    }
    const shiftLogs = getEmployeeLogs();
    setLogs(shiftLogs);
  };

  const handleDeleteLog = (logId) => {
    if (window.confirm(`Are you sure you want to delete this shift record?`)) {
      const shiftLogs = getEmployeeLogs();
      const updated = shiftLogs.filter(log => log.id !== logId);
      saveEmployeeLogs(updated);
      setLogs(updated);
    }
  };

  const handleEndShift = (logId) => {
    const shiftLogs = getEmployeeLogs();
    const updated = shiftLogs.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          logoutTime: new Date().toISOString()
        };
      }
      return log;
    });
    saveEmployeeLogs(updated);
    setLogs(updated);
    alert('Shift ended successfully.');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch (e) {
      return timeStr;
    }
  };

  // Find Employee ID from employees array matching the log email
  const getEmployeeId = (email) => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    return emp ? emp.id : 'emp_9821';
  };

  // Filters
  const filteredLogs = logs.filter(log => {
    const empId = getEmployeeId(log.employeeEmail);
    const matchesSearch = 
      log.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(empId).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || 
      log.role.toLowerCase() === roleFilter.toLowerCase() ||
      (roleFilter.toLowerCase() === 'chef' && log.role.toLowerCase() === 'kitchen') ||
      (roleFilter.toLowerCase() === 'manager' && log.role.toLowerCase() === 'admin');
    return matchesSearch && matchesRole;
  });

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpPassword) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await addEmployee({
        name: newEmpName,
        email: newEmpEmail,
        role: newEmpRole,
        password: newEmpPassword
      });
      alert('Employee registered successfully!');
      setIsAddModalOpen(false);
      // Reset form
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpRole('chef');
      setNewEmpPassword('');
      // Reload employee list
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to register employee');
    } finally {
      setSubmitting(false);
    }
  };

  const headers = ['Emp ID', 'Name', 'Email', 'Login Time', 'Logout Time', 'Role', 'Action'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-standard)', transition: 'background-color var(--transition-speed), color var(--transition-speed)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header title="Employees Record" />
        
        <main style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Description */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="handwritten" style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>Staff Attendance & Shifts</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Manage shift durations, login / logout timings, and security clearance roles.</p>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                backgroundColor: 'var(--border-focus)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-focus-hover, #d24e0b)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-focus)'}
            >
              Add Employee
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 14px', width: '300px' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input 
                type="text"
                placeholder="Search by ID, name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>

            {/* Role filter buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Filter Role:</span>
              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', padding: '2px' }}>
                {['All', 'Manager', 'Chef'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    style={{
                      padding: '6px 14px',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backgroundColor: roleFilter === role ? 'var(--border-focus)' : 'transparent',
                      color: roleFilter === role ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            transition: 'background-color var(--transition-speed), border-color var(--transition-speed)'
          }}>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No attendance logs found.
              </div>
            ) : (
              <Table
                headers={headers}
                data={filteredLogs}
                renderRow={(log) => {
                  const empId = getEmployeeId(log.employeeEmail);
                  return (
                    <>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
                        {empId}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {log.employeeName}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {log.employeeEmail}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LogIn size={13} color="#10b981" />
                          {formatTime(log.loginTime)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        {log.logoutTime ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <LogOut size={13} color="#ef4444" />
                            {formatTime(log.logoutTime)}
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981'
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                            Active Duty
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          backgroundColor:
                            log.role === 'manager' || log.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                          color:
                            log.role === 'manager' || log.role === 'admin' ? '#ef4444' : '#ea580c',
                        }}>
                          {log.role === 'kitchen' ? 'chef' : log.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!log.logoutTime && (
                            <button
                              onClick={() => handleEndShift(log.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: 'var(--bg-button)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button-hover)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-button)'}
                            >
                              End Shift
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Delete Log Entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </>
                  );
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setIsAddModalOpen(false)}
        >
          <div style={{
            width: '400px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Register New Employee</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@cafe.com"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>Assign Role</label>
                <select
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <option value="chef">Chef</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'left' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newEmpPassword}
                  onChange={(e) => setNewEmpPassword(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-button)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--border-focus)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {submitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

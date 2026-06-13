import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/db';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedEmployees = localStorage.getItem('employees');
    const storedLogs = localStorage.getItem('employee_logs');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees([]);
      localStorage.setItem('employees', '[]');
    }

    if (!storedLogs) {
      localStorage.setItem('employee_logs', '[]');
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      localStorage.removeItem('token');
      setToken(null);
      const data = await authAPI.login(email, password);
      const accessToken = data.access;

      localStorage.setItem('token', accessToken);
      setToken(accessToken);

      const userData = await authAPI.getCurrentUser();
      const userInfo = {
        id: userData.id,
        email: userData.email,
        name: userData.full_name,
        role: userData.role,
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Record employee shift if not admin
      if (userData.role !== 'admin') {
        const storedLogs = localStorage.getItem('employee_logs');
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        logs.forEach(log => {
          if (log.employeeEmail === userData.email && !log.logoutTime) {
            log.logoutTime = new Date().toISOString();
          }
        });
        logs.unshift({
          id: `log_${Date.now()}`,
          employeeEmail: userData.email,
          employeeName: userData.full_name,
          role: userData.role,
          loginTime: new Date().toISOString(),
          logoutTime: null
        });
        localStorage.setItem('employee_logs', JSON.stringify(logs));
      }

      return { success: true, role: userData.role };
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const registerEmployee = (name, email, password, role = 'cashier') => {
    if (employees.some(emp => emp.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newEmp = { 
      id: `emp_${Math.floor(1000 + Math.random() * 9000)}`,
      name, 
      email, 
      password, 
      role 
    };
    const updatedEmployees = [...employees, newEmp];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    return { success: true, employee: newEmp };
  };

  const logout = () => {
    if (user && user.role !== 'admin') {
      const storedLogs = localStorage.getItem('employee_logs');
      if (storedLogs) {
        const logs = JSON.parse(storedLogs);
        const activeLogIndex = logs.findIndex(log => log.employeeEmail === user.email && !log.logoutTime);
        if (activeLogIndex !== -1) {
          logs[activeLogIndex].logoutTime = new Date().toISOString();
          localStorage.setItem('employee_logs', JSON.stringify(logs));
        }
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    employees,
    login,
    registerEmployee,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize employees and session state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedEmployees = localStorage.getItem('employees');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    if (storedEmployees) {
      let parsed = JSON.parse(storedEmployees);
      let updated = false;
      parsed = parsed.map(emp => {
        if (emp.email === 'john@cafe.com' && emp.password === 'john123') {
          updated = true;
          return { ...emp, password: 'john@123' };
        }
        return emp;
      });
      if (updated) {
        localStorage.setItem('employees', JSON.stringify(parsed));
      }
      setEmployees(parsed);
    } else {
      // Seed default employee accounts
      const defaultEmployees = [
        { name: 'Cashier John', email: 'john@cafe.com', password: 'john@123', role: 'cashier' },
        { name: 'Waiter Sarah', email: 'sarah@cafe.com', password: 'sarah123', role: 'waiter' }
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // 1. Check admin credentials
    if (email === 'cafe@admin.com' && password === 'cafe123') {
      const adminUser = { email: 'cafe@admin.com', name: 'Cafe Admin', role: 'admin' };
      const adminToken = 'mock-token-admin';
      setUser(adminUser);
      setToken(adminToken);
      localStorage.setItem('token', adminToken);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return { success: true, role: 'admin' };
    }

    // 2. Check employee credentials
    const foundEmp = employees.find(emp => emp.email === email && emp.password === password);
    if (foundEmp) {
      const empToken = `mock-token-employee-${foundEmp.email}`;
      setUser(foundEmp);
      setToken(empToken);
      localStorage.setItem('token', empToken);
      localStorage.setItem('user', JSON.stringify(foundEmp));
      return { success: true, role: foundEmp.role };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const registerEmployee = (name, email, password, role = 'cashier') => {
    // Check if email already exists
    if (email === 'cafe@admin.com' || employees.some(emp => emp.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    const newEmp = { name, email, password, role };
    const updatedEmployees = [...employees, newEmp];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    return { success: true, employee: newEmp };
  };

  const logout = () => {
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

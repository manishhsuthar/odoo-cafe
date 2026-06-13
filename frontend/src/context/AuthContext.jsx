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
    const storedLogs = localStorage.getItem('employee_logs');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    const defaultEmployees = [
      { id: 'emp_001', name: 'Manager Clara', email: 'clara@cafe.com', password: 'clara123', role: 'manager' },
      { id: 'emp_002', name: 'Chef Mario', email: 'mario@cafe.com', password: 'mario123', role: 'chef' },
      { id: 'emp_003', name: 'Chef John', email: 'john@cafe.com', password: 'john@123', role: 'chef' },
      { id: 'emp_004', name: 'Chef Sarah', email: 'sarah@cafe.com', password: 'sarah123', role: 'chef' }
    ];

    if (storedEmployees) {
      let parsed = JSON.parse(storedEmployees);
      // Enforce the roles manager/chef on existing employees in localStorage
      let changed = false;
      defaultEmployees.forEach(def => {
        if (!parsed.some(e => e.email === def.email)) {
          parsed.push(def);
          changed = true;
        }
      });
      parsed = parsed.map(emp => {
        if (emp.email === 'john@cafe.com' && emp.password === 'john123') {
          changed = true;
          return { ...emp, password: 'john@123', role: 'chef', name: 'Chef John' };
        }
        if (emp.role !== 'manager' && emp.role !== 'chef') {
          changed = true;
          emp.role = 'chef';
        }
        if (!emp.id) {
          changed = true;
          emp.id = `emp_${Math.floor(1000 + Math.random() * 9000)}`;
        }
        return emp;
      });
      if (changed) {
        localStorage.setItem('employees', JSON.stringify(parsed));
      }
      setEmployees(parsed);
    } else {
      setEmployees(defaultEmployees);
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }

    if (!storedLogs) {
      const defaultLogs = [
        { id: 'log_1', employeeEmail: 'john@cafe.com', employeeName: 'Chef John', role: 'chef', loginTime: new Date(Date.now() - 5*3600*1000).toISOString(), logoutTime: new Date(Date.now() - 1*3600*1000).toISOString() },
        { id: 'log_2', employeeEmail: 'mario@cafe.com', employeeName: 'Chef Mario', role: 'chef', loginTime: new Date(Date.now() - 6*3600*1000).toISOString(), logoutTime: new Date(Date.now() - 2*3600*1000).toISOString() },
        { id: 'log_3', employeeEmail: 'clara@cafe.com', employeeName: 'Manager Clara', role: 'manager', loginTime: new Date(Date.now() - 4*3600*1000).toISOString(), logoutTime: null },
        { id: 'log_4', employeeEmail: 'sarah@cafe.com', employeeName: 'Chef Sarah', role: 'chef', loginTime: new Date(Date.now() - 3*3600*1000).toISOString(), logoutTime: new Date(Date.now() - 1*3600*1000).toISOString() }
      ];
      localStorage.setItem('employee_logs', JSON.stringify(defaultLogs));
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

      // Record login shift time
      const storedLogs = localStorage.getItem('employee_logs');
      const logs = storedLogs ? JSON.parse(storedLogs) : [];
      // Close any previous open sessions for this employee
      logs.forEach(log => {
        if (log.employeeEmail === foundEmp.email && !log.logoutTime) {
          log.logoutTime = new Date().toISOString();
        }
      });
      logs.unshift({
        id: `log_${Date.now()}`,
        employeeEmail: foundEmp.email,
        employeeName: foundEmp.name,
        role: foundEmp.role,
        loginTime: new Date().toISOString(),
        logoutTime: null
      });
      localStorage.setItem('employee_logs', JSON.stringify(logs));

      return { success: true, role: foundEmp.role };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const registerEmployee = (name, email, password, role = 'cashier') => {
    // Check if email already exists
    if (email === 'cafe@admin.com' || employees.some(emp => emp.email === email)) {
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
    // Record logout time in logs
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

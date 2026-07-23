import React, { createContext, useState, useEffect } from 'react';
import authAPI from '../services/authService';
import store from '../store/store';
import { loginSuccess, logoutSuccess } from '../features/auth/authSlice';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const clearSessionState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('pos_session_logs');
    sessionStorage.clear();
    if (store) {
      try {
        store.dispatch(logoutSuccess());
      } catch (e) {
        console.error('Failed to dispatch logout to store:', e);
      }
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        clearSessionState();
        setLoading(false);
        return;
      }

      try {
        // Validate token with backend API (/api/auth/me/) before trusting session
        const userData = await authAPI.getCurrentUser();
        if (userData && userData.id && userData.role) {
          const userInfo = {
            id: userData.id,
            email: userData.email,
            name: userData.full_name,
            role: userData.role,
          };
          setUser(userInfo);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(userInfo));
          if (store) {
            try {
              store.dispatch(loginSuccess({ user: userInfo, token: storedToken }));
            } catch (e) {
              console.error('Failed to dispatch loginSuccess:', e);
            }
          }
        } else {
          clearSessionState();
        }
      } catch (err) {
        // Token is invalid, expired, or revoked by backend -> purge session completely
        clearSessionState();
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      try {
        setEmployees(JSON.parse(storedEmployees));
      } catch (e) {
        setEmployees([]);
      }
    } else {
      setEmployees([]);
      localStorage.setItem('employees', '[]');
    }

    if (!localStorage.getItem('employee_logs')) {
      localStorage.setItem('employee_logs', '[]');
    }
  }, []);

  const login = async (email, password) => {
    // 1. Purge any previous session/user data before starting new login attempt
    clearSessionState();

    try {
      // 2. Authenticate with backend API
      const data = await authAPI.login(email, password);
      const accessToken = data.access;
      if (!accessToken) {
        throw new Error('No access token returned from server');
      }

      // 3. Temporarily set token in localStorage and state for user verification
      localStorage.setItem('token', accessToken);
      setToken(accessToken);

      // 4. Always fetch verified user profile and role from backend (/api/auth/me/)
      const userData = await authAPI.getCurrentUser();
      const userInfo = {
        id: userData.id,
        email: userData.email,
        name: userData.full_name,
        role: userData.role,
      };

      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      if (store) {
        try {
          store.dispatch(loginSuccess({ user: userInfo, token: accessToken }));
        } catch (e) {
          console.error('Failed to dispatch loginSuccess:', e);
        }
      }

      // Record employee shift if non-admin
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
      // Failed login: ensure session remains completely cleared
      clearSessionState();
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const registerEmployee = async (name, email, password, role = 'cashier') => {
    try {
      const created = await authAPI.register(name, email, password, role);
      return { success: true, employee: created };
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to register employee';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    if (user && user.role !== 'admin') {
      const storedLogs = localStorage.getItem('employee_logs');
      if (storedLogs) {
        try {
          const logs = JSON.parse(storedLogs);
          const activeLogIndex = logs.findIndex(log => log.employeeEmail === user.email && !log.logoutTime);
          if (activeLogIndex !== -1) {
            logs[activeLogIndex].logoutTime = new Date().toISOString();
            localStorage.setItem('employee_logs', JSON.stringify(logs));
          }
        } catch (e) {
          console.error('Error updating shift log on logout:', e);
        }
      }
    }

    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore backend logout errors
    }

    clearSessionState();
  };

  const value = {
    user,
    token,
    loading,
    employees,
    login,
    registerEmployee,
    logout,
    isAuthenticated: !!(user && token),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


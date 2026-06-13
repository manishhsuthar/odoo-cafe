import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Products from '../pages/Products/Products';
import Categories from '../pages/Categories/Categories';
import Employees from '../pages/Employees/Employees';
import Tables from '../pages/Tables/Tables';
import Orders from '../pages/Orders/Orders';
import Customers from '../pages/Customers/Customers';
import Reports from '../pages/Reports/Reports';
import POS from '../pages/POS/POS';
import KDS from '../pages/KDS/KDS';
import PaymentMethods from '../pages/PaymentMethods/PaymentMethods';
import Coupons from '../pages/Coupons/Coupons';
import KitchenInventory from '../pages/KitchenInventory/KitchenInventory';
import TableBooking from '../pages/TableBooking/TableBooking';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <Employees />
          </PrivateRoute>
        }
      />
      <Route
        path="/tables"
        element={
          <PrivateRoute>
            <Tables />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <PrivateRoute>
            <Customers />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <PrivateRoute>
            <POS />
          </PrivateRoute>
        }
      />
      <Route
        path="/kds"
        element={
          <PrivateRoute>
            <KDS />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <PrivateRoute>
            <PaymentMethods />
          </PrivateRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <PrivateRoute>
            <Coupons />
          </PrivateRoute>
        }
      />
      <Route
        path="/kitchen-inventory"
        element={
          <PrivateRoute>
            <KitchenInventory />
          </PrivateRoute>
        }
      />
      <Route
        path="/table-booking"
        element={
          <PrivateRoute>
            <TableBooking />
          </PrivateRoute>
        }
      />

      {/* Fallback redirecting to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

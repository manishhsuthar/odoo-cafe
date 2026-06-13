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
import POSSessions from '../pages/POSSessions/POSSessions';

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
          <PrivateRoute adminOnly>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute adminOnly>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute adminOnly>
            <Categories />
          </PrivateRoute>
        }
      />      <Route
        path="/employees"
        element={
          <PrivateRoute adminOnly>
            <Employees />
          </PrivateRoute>
        }
      />

      <Route
        path="/tables"
        element={
          <PrivateRoute adminOnly>
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
          <PrivateRoute adminOnly>
            <Customers />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute adminOnly>
            <Reports />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <PrivateRoute>
            <POS view="pos" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-orders"
        element={
          <PrivateRoute>
            <POS view="orders" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-products"
        element={
          <PrivateRoute>
            <POS view="products" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-categories"
        element={
          <PrivateRoute>
            <POS view="categories" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-payment-methods"
        element={
          <PrivateRoute>
            <POS view="payment-methods" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-coupons"
        element={
          <PrivateRoute>
            <POS view="coupons" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-bookings"
        element={
          <PrivateRoute>
            <POS view="bookings" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-employees"
        element={
          <PrivateRoute>
            <POS view="employees" />
          </PrivateRoute>
        }
      />
      <Route
        path="/pos-reports"
        element={
          <PrivateRoute>
            <POS view="reports" />
          </PrivateRoute>
        }
      />      <Route
        path="/pos-sessions"
        element={
          <PrivateRoute adminOnly>
            <POSSessions />
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
          <PrivateRoute adminOnly>
            <PaymentMethods />
          </PrivateRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <PrivateRoute adminOnly>
            <Coupons />
          </PrivateRoute>
        }
      />
      <Route
        path="/kitchen-inventory"
        element={
          <PrivateRoute adminOnly>
            <KitchenInventory />
          </PrivateRoute>
        }
      />
      <Route
        path="/table-booking"
        element={
          <PrivateRoute adminOnly>
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

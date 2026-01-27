import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/dashboard-component/Sidebar";
import Header from "../components/dashboard-component/Header";
import Footer from "../components/dashboard-component/Footer";
import { useIsAuthenticated } from "../config/store/authStore";

const DashboardLayout = () => {
  const isAuthenticated = useIsAuthenticated();

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div id="layout-wrapper">
      <Header />
      <Sidebar />

      <div className="main-content">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
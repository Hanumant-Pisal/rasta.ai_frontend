import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import DashboardLayout from "./components/DashboardLayout";
import { useSelector } from "react-redux";


const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      {children || <Outlet />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Analytics />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<div className="p-6">Settings Page</div>} />
          <Route path="/project/:id" element={<ProjectPage />} />
        </Route>
        
      
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

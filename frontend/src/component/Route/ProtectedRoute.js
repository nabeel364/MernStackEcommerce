import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { loading, isAuthenticated } = useSelector((state) => state.user);
  
  if(loading === false) {
    if(isAuthenticated === false) {
      return <Navigate to='/login' />;
    }
    else {
      return <Outlet />;
    }
  }
};

export default ProtectedRoute;

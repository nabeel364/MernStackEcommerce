import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({isAdmin}) => {
  const { user } = useSelector((state) => state.user);
  
  if(isAdmin === true && user.role !== "admin") {
    return <Navigate to='/login' />;
  }
  else {
    return <Outlet />;
  }
};

export default ProtectedRoute;
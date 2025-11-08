import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import toast from "react-hot-toast";

/**
 * Protects specific routes.
 * Pass `adminOnly` to restrict only to your admin email.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // 👑 Replace with your Firebase email
  const ADMIN_EMAIL = "roshansharma7250@gmail.com";

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
      } else if (adminOnly && user.email !== ADMIN_EMAIL) {
        toast.error("Access denied! Admins only.");
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-semibold text-gray-600">
        Loading...
      </div>
    );
  }

  return user && (!adminOnly || user.email === ADMIN_EMAIL) ? children : null;
};

export default ProtectedRoute;

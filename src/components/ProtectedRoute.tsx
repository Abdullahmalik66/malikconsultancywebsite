import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/firebase/AuthContext";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-m3-surface text-m3-on-surface flex flex-col items-center justify-center font-sans">
        <div className="text-center p-8 max-w-md flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-m3-primary/10 border-t-m3-primary relative"
          >
            <Sparkles className="w-5 h-5 text-m3-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-display font-medium text-m3-primary"
          >
            Verifying session...
          </motion.h3>
          <p className="text-sm font-sans text-m3-on-surface/60">
            Please wait while we secure your environment.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page, saving the original location in state
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

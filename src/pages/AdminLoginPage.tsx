import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import { motion } from "motion/react";
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const { currentUser, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation and Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // If already logged in, redirect straight to admin panel
  if (currentUser) {
    const from = (location.state as any)?.from?.pathname || "/admin";
    return <Navigate to={from} replace />;
  }

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await signIn(email, password);
      // AuthProvider triggers redirect dynamically, but let's navigate to safety
      const from = (location.state as any)?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    } catch (err: any) {
      // Requirements call for showing "Invalid login credentials." for incorrect details
      // and not showing raw Firebase error dumps.
      setFormError("Invalid login credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="admin-login-viewport"
      className="min-h-screen bg-gradient-to-tr from-[#fbfafc] via-[#f5f3fa] to-[#efedf5] dark:from-[#141218] dark:via-[#1c1b22] dark:to-[#25232a] text-m3-on-surface flex items-center justify-center font-sans px-4 py-24 select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
        className="w-full max-w-[480px] bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 p-8 md:p-10 rounded-[32px] shadow-lg relative overflow-hidden"
      >
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-m3-primary" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-m3-secondary-container text-m3-on-secondary-container rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Sparkles className="w-6 h-6 text-m3-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-m3-on-surface tracking-tight mb-2">
            Artery Console
          </h1>
          <p className="text-sm font-sans text-m3-on-surface/60 max-w-xs">
            Sign in to access secure administration and control surfaces.
          </p>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-m3-primary/10 dark:bg-m3-primary/20 text-m3-primary dark:text-[#d0bcff] p-4 rounded-2xl mb-6 text-sm font-medium"
            id="login-error-banner"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wider text-m3-on-surface/50 uppercase block pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-m3-on-surface/40 pointer-events-none" />
              <input
                type="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="admin@malikconsultancy.com"
                className={`w-full font-sans pl-12 pr-4 py-3.5 bg-m3-surface/50 dark:bg-m3-surface/10 rounded-2xl border-2 outline-none transition-all text-m3-on-surface placeholder-m3-on-surface/30 ${
                  emailError
                    ? "border-m3-primary focus:border-m3-primary"
                    : "border-m3-outline/20 focus:border-m3-primary"
                }`}
                aria-label="Email Address"
              />
            </div>
            {emailError && (
              <span className="text-xs font-semibold text-m3-primary pl-1 block">
                {emailError}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wider text-m3-on-surface/50 uppercase block pl-1">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-m3-on-surface/40 pointer-events-none" />
              <input
                type="password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="••••••••"
                className={`w-full font-sans pl-12 pr-4 py-3.5 bg-m3-surface/50 dark:bg-m3-surface/10 rounded-2xl border-2 outline-none transition-all text-m3-on-surface placeholder-m3-on-surface/30 ${
                  passwordError
                    ? "border-m3-primary focus:border-m3-primary"
                    : "border-m3-outline/20 focus:border-m3-primary"
                }`}
                aria-label="Password"
              />
            </div>
            {passwordError && (
              <span className="text-xs font-semibold text-m3-primary pl-1 block">
                {passwordError}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!isSubmitting ? { scale: 1.01 } : {}}
            whileTap={!isSubmitting ? { scale: 0.99 } : {}}
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-m3-primary text-m3-on-primary hover:bg-m3-primary/95 font-sans font-bold rounded-full shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-medium text-m3-primary hover:underline cursor-pointer"
          >
            ← Return to public website
          </button>
        </div>
      </motion.div>
    </div>
  );
}

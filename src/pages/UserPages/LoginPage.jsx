import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const {
    login,
    forgotPassword,
    resetPassword,
    resendOTP,
    loading,
    error,
    clearError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef(null);
  const [resetMsg, setResetMsg] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [newPw, setNewPw] = useState("");
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      const result = await login({ email, password });
      if (result.success) {
        if (result.user.type === "admin" || result.user.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleOtpInput = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newInputs = [...otpInputs];
    newInputs[idx] = val;
    setOtpInputs(newInputs);
    if (val && idx < 5) {
      document.getElementById(`otp-input-${idx + 1}`)?.focus();
    }
    if (!val && idx > 0) {
      document.getElementById(`otp-input-${idx - 1}`)?.focus();
    }
  };
  const otp = otpInputs.join("");

  const handleForgot = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setResetError("");
    setEmailWarning("");
    try {
      const data = await forgotPassword(forgotEmail);
      setOtpSent(true);
      setResetMsg("OTP sent to your email.");
      setEmailWarning(data.emailWarning || "");
      setResendCooldown(60);
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResetError(err.message);
    }
  };

  const handleResendOtp = async () => {
    setResetError("");
    setEmailWarning("");
    try {
      const data = await resendOTP(forgotEmail);
      setResetMsg("OTP resent to your email.");
      setEmailWarning(data.emailWarning || "");
      setResendCooldown(60);
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResetError(err.message);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setResetError("");
    setEmailWarning("");
    if (otp.length !== 6) {
      setResetError("Please enter all 6 digits of the OTP.");
      return;
    }
    try {
      const data = await resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp,
        newPassword: newPw,
      });
      setResetMsg("Password reset successfully! You can now log in.");
      setShowForgot(false);
      setOtpSent(false);
      setForgotEmail("");
      setOtpInputs(["", "", "", "", "", ""]);
      setNewPw("");
      setEmailWarning(data.emailWarning || "");
    } catch (err) {
      setResetError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-dark focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-primary rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-dark focus:border-transparent"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary-dark text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary-darker"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <button
          type="button"
          className="text-primary-dark underline mt-2 block mx-auto"
          onClick={() => setShowForgot(true)}
        >
          Forgot Password?
        </button>
        {showForgot && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500"
                onClick={() => setShowForgot(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">Reset Password</h3>
              {!otpSent ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                  {resetError && (
                    <div className="text-red-500 text-sm">{resetError}</div>
                  )}
                  {resetMsg && (
                    <div className="text-green-600 text-sm">{resetMsg}</div>
                  )}
                  {emailWarning && (
                    <div className="text-yellow-600 text-sm">
                      {emailWarning}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-primary-dark text-white py-2 rounded-lg font-semibold"
                  >
                    Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="flex justify-center space-x-2 mb-2">
                    {otpInputs.map((val, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        className="w-10 h-12 text-center border-2 border-primary rounded-lg text-xl font-mono focus:ring-2 focus:ring-primary-dark focus:border-primary-dark transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="New Password"
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                  {resetError && (
                    <div className="text-red-500 text-sm">{resetError}</div>
                  )}
                  {resetMsg && (
                    <div className="text-green-600 text-sm">{resetMsg}</div>
                  )}
                  {emailWarning && (
                    <div className="text-yellow-600 text-sm">
                      {emailWarning}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-primary-dark text-white py-2 rounded-lg font-semibold"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    className={`w-full mt-2 py-2 rounded-lg font-semibold border ${
                      resendCooldown > 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-primary-light text-primary-dark hover:bg-primary-dark hover:text-white"
                    }`}
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : "Resend OTP"}
                  </button>
                  {resetError && (
                    <div className="text-red-500 text-sm">{resetError}</div>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            className="text-primary-dark hover:underline font-semibold"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

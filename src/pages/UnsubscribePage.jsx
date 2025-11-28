import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resubscribeEmail, setResubscribeEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleUnsubscribe(token);
    } else {
      setStatus("no-token");
    }
  }, [searchParams]);

  const handleUnsubscribe = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/unsubscribe?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail(data.email);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to unsubscribe");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while processing your request");
    }
  };

  const handleResubscribe = async (e) => {
    e.preventDefault();
    if (!resubscribeEmail) {
      setMessage("Please enter your email address");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/unsubscribe/resubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resubscribeEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setResubscribeEmail("");
      } else {
        setMessage(data.error || "Failed to resubscribe");
      }
    } catch (error) {
      setMessage("An error occurred while processing your request");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your request...</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Successfully Unsubscribed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            {email && (
              <p className="text-sm text-gray-500 mb-6">
                Email: <span className="font-medium">{email}</span>
              </p>
            )}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Want to stay updated?</h3>
              <p className="text-gray-600 mb-4">
                You can resubscribe to receive promotional emails about our latest sales and offers.
              </p>
              <form onSubmit={handleResubscribe} className="space-y-3">
                <input
                  type="email"
                  value={resubscribeEmail}
                  onChange={(e) => setResubscribeEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-primary-dark text-white py-2 rounded-lg font-semibold hover:bg-primary-darker transition-colors"
                >
                  Resubscribe
                </button>
              </form>
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-darker transition-colors"
            >
              Back to Home
            </button>
          </div>
        );

      case "no-token":
        return (
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Request</h2>
            <p className="text-gray-600 mb-6">
              This unsubscribe link is invalid or has expired. Please contact us if you need assistance.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-darker transition-colors"
            >
              Back to Home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src="https://protoinfrastack.ivondy.com/media/XjM642wlbGinVtEapwWpTAKGJyfQq6p27KnN"
            alt="Yaqeen Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">Email Preferences</h1>
        </div>

        {renderContent()}

        {message && status !== "loading" && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

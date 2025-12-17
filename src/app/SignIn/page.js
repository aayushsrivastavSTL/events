"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear existing verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Create new verifier
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
        },
        auth
      );
    }
  }, []);

  // Helper function to format phone number consistently
  const formatPhoneNumber = (phoneNumber) => {
    let value = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
    console.log(value);
    return value;
  };

  // Send OTP
  const handleSendOTP = async () => {
    setError("");
    setSuccess("");
    setSending(true);
    setResendCountdown(60);

    try {
      //first verify user exits then send otp
      const userExists = await checkIfUserExists();
      if (!userExists) {
        setError("User not found! Please sign up first.");
        setSending(false);
        setResendCountdown(0);
        return;
      }

      const formattedPhone = formatPhoneNumber(phone);

      if (!window.recaptchaVerifier) {
        throw new Error("Recaptcha verifier not initialized");
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setSuccess("OTP sent successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to send OTP";

      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      }

      setError(errorMessage);
      setResendCountdown(0);
    } finally {
      setSending(false);
    }
  };

  // Countdown effect for resend OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!confirmationResult) {
      setError("Please request OTP first");
      return;
    }

    setError("");
    setVerifying(true);

    try {
      const result = await confirmationResult.confirm(otp);
      console.log("result",result);
      setSuccess("Phone verified successfully!");
      // Get Firebase ID token
      const idToken = await auth.currentUser.getIdToken(true);
      console.log("idToken", idToken);

      // const firebaseToken = await result.user.getIdToken(true);
      // console.log("firebaseToken", firebaseToken);
      // Add your post-verification logic here
      await logInProcesses(idToken);

      setTimeout(() => {
        router.push("/"); 
      }, 2000); 
    } catch (err) {
      console.error(err);


      setError("Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const checkIfUserExists = async () => {
    try {
      // Format phone number with + prefix
      const formattedPhone = formatPhoneNumber(phone);
      console.log(formattedPhone, "formattedPhone in checkIfUserExists");
      const encodedPath = encodeURIComponent(
        `auth/check-exists?phone=${formattedPhone}`
      );
      const res = await fetch(`/api/proxy?path=${encodedPath}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      console.log("checkIfUserExists", data);
      if (data) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Failed to check user exists", err);
      toast.error("Failed to check user exists. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
      return false;
    }
  };

  const logInProcesses = async (firebaseToken) => {
    try {
      const encodedPath = encodeURIComponent(`auth/login`);

      const payload = {
        phone: formatPhoneNumber(phone),
      };

      const res = await fetch(`/api/proxy?path=${encodedPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      console.log("log in data", data);
      const accessToken = data.token;

      // 🔁 Call the API to set cookie on server
      await fetch("/api/setCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      });
      // ✅ Show success toast
      toast.success("Login successful", {
        position: "top-center",
        duration: 3000,
      });
    } catch (err) {
      console.log("Failed to login", err);
      toast.error("Login failed", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  return (
    <div className="w-full flex justify-center items-center h-screen">
      <div className="rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 md:p-10 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome To Jyot
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Sign in for Vasudaiva Kutumbakum Event 2026
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4 sm:space-y-5">
          {/* Phone Number Input */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Phone Number
            </label>
            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputStyle={{
                width: "100%",
                height: "48px",
                fontSize: "14px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
              buttonStyle={{
                borderRadius: "12px 0 0 12px",
                border: "1px solid #e5e7eb",
              }}
              containerStyle={{
                width: "100%",
              }}
            />
          </div>

          {/* OTP Input */}
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              OTP
            </label>
            <div className="relative">
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 sm:py-3.5 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm sm:text-base"
                maxLength="6"
                disabled={!confirmationResult}
              />
              <button
                onClick={handleSendOTP}
                disabled={
                  !phone || phone.length < 10 || sending || resendCountdown > 0
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                type="button"
              >
                {sending
                  ? "Sending..."
                  : resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : confirmationResult
                  ? "Resend"
                  : "Send"}
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleVerifyOTP}
            disabled={otp.length < 6 || verifying || !confirmationResult}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-colors mt-6 text-sm sm:text-base shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying..." : "Continue"}
          </button>
        </div>
      </div>

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SignIn;

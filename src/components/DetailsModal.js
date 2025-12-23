"use client";
import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

const DetailsModal = ({ onClose, data, entry, exit, manualMode = false }) => {
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visitorCode, setVisitorCode] = useState("");
  const [borderColor, setBorderColor] = useState("");

  const currentCheckpoint =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("checkpoint"))
      : null;

  const getBorderColor = (flag) => {
    const colors = {
      red: "border-red-400",
      yellow: "border-yellow-400",
      green: "border-green-400",
    };
    return colors[flag?.toLowerCase()] || "border-gray-400";
  };

  const getButtonColor = (flag) => {
    const colors = {
      red: "bg-red-400 hover:bg-red-600",
      yellow: "bg-yellow-400 hover:bg-yellow-600",
      green: "bg-green-400 hover:bg-green-600",
    };
    return colors[flag?.toLowerCase()] || "bg-gray-400 hover:bg-gray-600";
  };

  const getTextColor = (flag) => {
    const colors = {
      red: "text-red-400",
      yellow: "text-yellow-400",
      green: "text-green-400",
    };
    return colors[flag?.toLowerCase()] || "text-green-400"; //default for checkout
  };

  useEffect(() => {
    if (manualMode) {
      // Manual entry mode - trigger error state
      setError("QR code not detected.");
      setVisitorCode("");
      return; 
    }
    if (data) {
      console.log("data from qr code", data);
      try {
        const parsed = JSON.parse(data);
        let code = parsed.visitorCode;
        code = code.toUpperCase();
        console.log(code);
        setVisitorCode(code);
      } catch (err) {
        console.error("Failed to parse data:", err);
        setError("Invalid QR code data");
      }
    }
  }, [data, manualMode]);

  const clickHandler = async () => {
    setLoading(true);
    setError(null);

    const endpoint = entry
      ? "volunteer/scan/checkin"
      : "volunteer/scan/checkout";

    try {
      const encodedPath = encodeURIComponent(endpoint);
      const res = await fetch(`/api/proxy?path=${encodedPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorCode: visitorCode,
          checkinpointID: currentCheckpoint.id,
        }),
        credentials: "include",
      });

      const data = await res.json();
      console.log("api data: ", data);
      if (!res.ok || !data.success) {
        const errorMessage = data.message || "An error occurred";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
        });
        setBorderColor("red");
        setLoading(false);
        return;
      }

      console.log("Response data:", data);
      setResult(data.message);
      setBorderColor(data.checkFlag);
      toast.success(data.message, {
        position: "top-center",
      });
    } catch (error) {
      console.log("Error:", error);
      setError(error.message);
      toast.error(error.message || "An error occurred", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm h-screen w-screen"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className={`w-full max-w-md rounded-xl bg-white shadow-2xl animate-scaleIn border-2 ${getBorderColor(
            borderColor
          )}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between border-b px-5 py-4 ${getBorderColor(
              borderColor
            )}`}
          >
            <h4 className="font-semibold text-gray-800">
              {entry ? "Check-In" : "Check-Out"} Details
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <RxCross2 className="text-2xl text-gray-800 font-semibold" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {/* QR Code Data */}
            {!manualMode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  QR Code Data:
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 wrap-break-word whitespace-pre-wrap">
                    {data}
                  </p>
                </div>
              </div>
            )}

            {/* Error Display with Manual Input */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 font-medium mb-3 text-sm">
                  ⚠️ {error}
                </p>

                {/* Manual Input Fallback */}
                <div className="space-y-2">
                  <label
                    htmlFor="visitor-code-input"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter visitor code / email manually:
                  </label>
                  <input
                    type="text"
                    id="visitor-code-input"
                    value={visitorCode}
                    onChange={(e) =>
                      setVisitorCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., VK-12345/visitor@gmail.com"
                    className="w-full text-sm px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <p className={`px-5 pb-4 ${getTextColor(borderColor)}`}>
                Result: {result}
              </p>
            )}
          </div>

          {/* Button */}
          <div className="p-5">
            <button
              onClick={clickHandler}
              disabled={loading} //Add error after testing
              className={`w-full py-4 text-white font-bold rounded-xl transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              } ${getButtonColor(borderColor)}`}
            >
              {loading
                ? "Processing..."
                : error
                ? "Submit"
                : entry
                ? "Check-In"
                : "Check-Out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;

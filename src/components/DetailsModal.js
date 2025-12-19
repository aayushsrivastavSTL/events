"use client";
import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

const DetailsModal = ({ onClose, data, entry, exit }) => {
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visitorCode, setVisitorCode] = useState(null);
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
    if (data) {
      console.log("data from qr code", data);
      try {
        const parsed = JSON.parse(data);
        const code = parsed.visitorCode;
        console.log(code);
        setVisitorCode(code);
      } catch (err) {
        console.error("Failed to parse data:", err);
        setError("Invalid QR code data");
      }
    }
  }, [data]);

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
          className={`w-full max-w-md rounded-xl bg-white shadow-2xl animate-scaleIn border ${getBorderColor(
            borderColor
          )}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold text-gray-800">Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl"
            >
              <RxCross2 />
            </button>
          </div>

          {/* Body */}
          <p className="px-5 py-4 text-gray-700 wrap-break-words whitespace-pre-wrap overflow-x-auto text-sm">
            {data}
          </p>
          {/* Error Display */}
          {error && <p className="px-5 pb-4 text-red-600">Error: {error}</p>}
          {/* Result Display */}
          {result && (
            <p className={`px-5 pb-4 ${getTextColor(borderColor)}`}>
              Result: {result}
            </p>
          )}

          {/* Button */}
          <div className="p-5">
            <button
              onClick={clickHandler}
              disabled={loading} //Add error after testing
              className={`w-full py-4 text-white font-bold rounded-xl transition-colors ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : error
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              } ${getButtonColor(borderColor)}`}
            >
              {loading ? "Processing..." : entry ? "Check-In" : "Check-Out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;

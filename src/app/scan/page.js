// pages/scan.js or app/scan/page.js
// Install: npm install html5-qrcode

"use client"; // Use this if you're using App Router (app directory)

import { useEffect, useRef, useState, useContext } from "react";
import dynamic from "next/dynamic";
import { ImSpinner2 } from "react-icons/im";
import { Html5Qrcode } from "html5-qrcode";
import { UserContext } from "@/context/UserContext";

const DetailsModal = dynamic(() => import("@/components/DetailsModal"), {
  ssr: false,
});

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState("prompt");
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(UserContext);
  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);

  const storedCheckpoint = JSON.parse(localStorage.getItem("checkpoint"));
  console.log("storedCheckpoint", storedCheckpoint);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      return true;
    } catch (err) {
      console.error("Camera permission error:", err);
      setCameraPermission("denied");
      setError(
        "Camera permission denied. Please allow camera access in your browser settings."
      );
      return false;
    }
  };

  const safeStopScanner = async () => {
    if (!scannerRef.current || isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;

    try {
      const state = await scannerRef.current.getState();

      // Only stop if scanner is actually running or paused
      if (state === 2 || state === 3) {
        // 2 = SCANNING, 3 = PAUSED
        await scannerRef.current.stop();
      }

      // Clear the scanner
      try {
        scannerRef.current.clear();
      } catch (e) {
        // Ignore clear errors
      }
    } catch (err) {
      // If we can't get state, try to stop anyway
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    } finally {
      isStoppingRef.current = false;
    }
  };

  const startScanning = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    // Request permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      // Stop existing scanner if any
      if (scannerRef.current) {
        await safeStopScanner();
        // Small delay to ensure camera is fully released
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Create new scanner instance with unique ID
      const readerId = "reader";
      const html5QrCode = new Html5Qrcode(readerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Start scanning
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          console.log("QR Code detected:", decodedText);
          setResult(decodedText);
          setShowModal(true);
          setIsScanning(false);
          // Stop scanning after detection
          if (scannerRef.current) {
            safeStopScanner();
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (no QR in view)
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setError(`Failed to start scanner: ${err.message}`);
      setIsScanning(false);

      // Clean up on error
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // Ignore
        }
        scannerRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await safeStopScanner();
      setIsScanning(false);
    }
  };

  const scanAgain = async () => {
    setResult(null);
    setError(null);
    setShowModal(false);
    await startScanning();
  };

  return (
    <div className="w-full mt-15 min-h-screen">
      <div className="max-w-350 mx-auto p-4 md:p-6 flex flex-col justify-center items-center">
        {/* Volunteer details - top left */}
        <div className="mb-6 md:mb-8 md:ml-2 ">
          <h3 className="text-lg md:text-xl font-medium capitalize mb-1">
            {user?.name}
          </h3>
          <p className=" md:text-base text-gray-600">
            Scanning at checkpoint :{" "}
            <span className="text-orange-400 font-medium">
              {storedCheckpoint?.name}
            </span>
          </p>
          {/* current count - with glowing green light */}
          <div className="text-sm flex items-center text-gray-600 gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
            current count :{" "}
            <span className="text-orange-400 font-medium">45</span>
          </div>
        </div>

        {/* Card - centered */}
        <div className="flex justify-center items-start md:items-center">
          <div className="w-full max-w-md rounded-lg shadow-xl p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
              QR Code Scanner
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-6 text-center">
              Scan QR codes using your device camera
            </p>

            {/* Status indicator */}
            <div
              className={`mb-6 p-3 md:p-4 rounded-lg text-center font-medium text-sm md:text-base ${
                isScanning
                  ? " text-green-600  bg-green-100"
                  : " text-orange-600  bg-orange-100"
              }`}
            >
              {isScanning
                ? "✓ Camera Active - Point at QR Code"
                : "○ Camera Stopped"}
            </div>

            {/* Scanner viewport */}
            <div
              id="reader"
              className="w-full min-h-70 md:min-h-80 border border-orange-400 rounded-lg mb-6 overflow-hidden"
            ></div>

            {/* Control buttons */}
            <div className="mb-4">
              {!isScanning ? (
                <button
                  onClick={scanAgain}
                  className="w-full bg-orange-400 hover:bg-orange-600 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex justify-center items-center">
                      <ImSpinner2 className="animate-spin" />
                    </span>
                  ) : (
                    <span>Start Scanning</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-colors duration-200"
                >
                  Stop Camera
                </button>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
                <strong className="flex items-center gap-2 text-sm md:text-base">
                  ⚠️ Error:
                </strong>
                <p className="mt-2 text-sm md:text-base">{error}</p>
                {cameraPermission === "denied" && (
                  <p className="mt-2 text-xs md:text-sm text-red-700">
                    Please enable camera permissions in your browser settings
                    and refresh the page.
                  </p>
                )}
              </div>
            )}

            {/* DetailsModal for result */}
            {showModal && (
              <DetailsModal onClose={() => setShowModal(false)} data={result} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

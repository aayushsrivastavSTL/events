// pages/scan.js or app/scan/page.js
// Install: npm install html5-qrcode

"use client"; // Use this if you're using App Router (app directory)

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ImSpinner2 } from "react-icons/im";
import { Html5Qrcode } from "html5-qrcode";

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
  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>QR Code Scanner</h1>
        <p style={styles.subtitle}>Scan QR codes using your device camera</p>

        {/* Status indicator */}
        <div
          style={{
            ...styles.status,
            ...(isScanning ? styles.statusScanning : styles.statusStopped),
          }}
        >
          {isScanning
            ? "✓ Camera Active - Point at QR Code"
            : "○ Camera Stopped"}
        </div>

        {/* Scanner viewport */}
        <div id="reader" style={styles.reader}></div>

        {/* Control buttons */}
        <div style={styles.buttonGroup}>
          {!isScanning ? (
            <button
              onClick={scanAgain}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              {loading ? (
                <p className="flex justify-center items-center">
                  <ImSpinner2 />
                </p>
              ) : (
                <p>Start Scanning</p>
              )}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              Stop Camera
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.error}>
            <strong>⚠️ Error:</strong>
            <p style={{ marginTop: 8 }}>{error}</p>
            {cameraPermission === "denied" && (
              <p style={{ marginTop: 8, fontSize: 13 }}>
                Please enable camera permissions in your browser settings and
                refresh the page.
              </p>
            )}
          </div>
        )}

        {/* DetailsModal for result */}
        {showModal && (
          <DetailsModal onClose={() => setShowModal(false)} data={result} />
        )}

        {/* Info box */}
        {/* <div style={styles.infoBox}>
          <strong>📋 Instructions:</strong>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Click "Start Scanning" to activate camera</li>
            <li>Allow camera permissions when prompted</li>
            <li>Point camera at a QR code</li>
            <li>The code will be detected automatically</li>
            <li>Click "Scan Another" to scan more codes</li>
          </ul>
          <p style={{ marginTop: 10, fontSize: 12 }}>
            <strong>Note:</strong> This requires HTTPS to work on mobile devices.
          </p>
        </div> */}
      </div>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: 500,
    width: "100%",
    padding: 30,
  },
  title: {
    color: "#333",
    marginBottom: 10,
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  status: {
    textAlign: "center",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
  },
  statusScanning: {
    background: "#e8f5e9",
    color: "#2e7d32",
  },
  statusStopped: {
    background: "#fff3e0",
    color: "#e65100",
  },
  reader: {
    border: "2px solid #667eea",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    minHeight: 250,
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: "12px 20px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  buttonPrimary: {
    background: "#667eea",
    color: "white",
  },
  buttonSecondary: {
    background: "#e0e0e0",
    color: "#333",
  },
  error: {
    background: "#fee",
    border: "2px solid #f44336",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    color: "#c62828",
  },
  result: {
    background: "#f0f9ff",
    border: "2px solid #667eea",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resultTitle: {
    color: "#667eea",
    fontWeight: 600,
    marginBottom: 10,
    fontSize: 16,
  },
  resultText: {
    background: "white",
    padding: 15,
    borderRadius: 8,
    wordBreak: "break-all",
    color: "#333",
    fontFamily: '"Courier New", monospace',
    fontSize: 14,
    marginBottom: 15,
  },
  infoBox: {
    background: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    fontSize: 13,
    color: "#666",
  },
};

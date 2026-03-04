"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScannerModal({ orderId, onClose, onResult, embedded = false }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (e) {
          // Scanner already stopped
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanning = async () => {
    setError("");
    setResult(null);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop scanning after first successful read
          try {
            await scanner.stop();
          } catch (e) {
            // Already stopped
          }
          scannerRef.current = null;
          setScanning(false);
          await verifyQR(decodedText);
        },
        () => {} // ignore scan failures
      );

      setScanning(true);
    } catch (err) {
      setError(
        "Could not access camera. Please ensure camera permissions are granted."
      );
      console.error("Scanner error:", err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const verifyQR = async (qrData) => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });

      const data = await res.json();
      setResult(data);

      if (onResult) onResult(data);
    } catch {
      setResult({
        verified: false,
        message: "Failed to verify QR code. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const scannerContent = (
    <>
      {/* Scanner Area */}
      <div className={embedded ? "" : "p-6"}>
        {!embedded && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
              <p className="text-xs text-gray-500">
                Scan the customer&apos;s order QR code to verify
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div
          id="qr-reader"
          ref={containerRef}
          className="w-full rounded-xl overflow-hidden bg-gray-900"
          style={{ minHeight: scanning ? 300 : 0 }}
        />

        {!scanning && !result && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm mb-1">
              Point your camera at the customer&apos;s QR code
            </p>
            <p className="text-gray-400 text-xs">
              The QR code is on their orders page
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}

        {verifying && (
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Verifying order...</p>
          </div>
        )}

        {/* Result */}
        {result && !verifying && (
          <div className="mt-4">
            <div
              className={`rounded-xl p-5 text-center ${
                result.verified
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  result.verified ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {result.verified ? (
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className={`font-semibold text-sm ${result.verified ? "text-green-800" : "text-red-800"}`}>
                {result.verified ? "Verified Successfully!" : "Verification Failed"}
              </p>
              <p className={`text-xs mt-1 ${result.verified ? "text-green-600" : "text-red-600"}`}>
                {result.message}
              </p>

              {result.checks && !result.verified && (
                <div className="mt-3 text-left space-y-1">
                  {Object.entries(result.checks).map(([key, match]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className={match ? "text-green-600" : "text-red-600"}>
                        {match ? "✓" : "✗"}
                      </span>
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex gap-3 ${embedded ? "mt-4" : "px-6 pb-6"}`}>
        {!scanning && !result ? (
          <button
            onClick={startScanning}
            className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Start Camera
          </button>
        ) : scanning ? (
          <button
            onClick={stopScanning}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Stop Scanning
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setResult(null);
                startScanning();
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Scan Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Done
            </button>
          </>
        )}
      </div>
    </>
  );

  if (embedded) {
    return scannerContent;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {scannerContent}
      </div>
    </div>
  );
}

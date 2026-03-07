"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  eventId: number;
  eventTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ScanState = "scanning" | "processing" | "success" | "error" | "duplicate";

export default function QRScanner({
  eventId,
  eventTitle,
  onClose,
  onSuccess,
}: QRScannerProps) {
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [message, setMessage] = useState("");
  const [parentName, setParentName] = useState("");
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanningRef = useRef(true);

  const handleCheckin = useCallback(
    async (userId: number) => {
      setScanState("processing");
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, eventId }),
        });

        const data = await res.json();

        if (res.status === 409) {
          setScanState("duplicate");
          setMessage(data.error || "Already checked in");
          setParentName(data.parentName || "");
        } else if (!res.ok) {
          setScanState("error");
          setMessage(data.error || "Check-in failed");
        } else {
          setScanState("success");
          setMessage(data.message || "Checked in successfully!");
          setParentName(data.parentName || "");
          onSuccess();
        }
      } catch {
        setScanState("error");
        setMessage("Network error. Please try again.");
      }
    },
    [eventId, onSuccess]
  );

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(() => {
    scanningRef.current = true;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.play().then(() => {
          const tick = () => {
            if (!scanningRef.current) return;
            const canvas = canvasRef.current;
            if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
              animFrameRef.current = requestAnimationFrame(tick);
              return;
            }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              animFrameRef.current = requestAnimationFrame(tick);
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data) {
              try {
                const parsed = JSON.parse(code.data);
                if (parsed.type === "volunteer-checkin" && parsed.userId) {
                  scanningRef.current = false;
                  handleCheckin(parsed.userId);
                  return;
                }
              } catch {
                // Not a valid QR code for this app — keep scanning
              }
            }
            animFrameRef.current = requestAnimationFrame(tick);
          };
          animFrameRef.current = requestAnimationFrame(tick);
        });
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraError(
          "Could not access camera. Please allow camera permission and try again."
        );
      });
  }, [handleCheckin]);

  useEffect(() => {
    startCamera();
    return () => {
      scanningRef.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleScanAgain = () => {
    setMessage("");
    setParentName("");
    setScanState("scanning");
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Check-in Parent</h2>
          <p className="text-green-300 text-xs">{eventTitle}</p>
        </div>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-white bg-white/20 rounded-full p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {scanState === "scanning" && (
          <div className="relative w-full max-w-sm">
            {cameraError ? (
              <div className="bg-red-900/80 rounded-2xl p-6 text-center">
                <p className="text-white text-sm">{cameraError}</p>
                <button
                  onClick={() => {
                    setCameraError("");
                    startCamera();
                  }}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl overflow-hidden bg-black">
                  {/* Hidden canvas for jsQR processing */}
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Visible video feed */}
                  <video
                    ref={videoRef}
                    className="w-full"
                    muted
                    playsInline
                  />
                </div>
                {/* Scan overlay corners */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-green-400 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                  </div>
                </div>
                <p className="text-white text-center text-sm mt-4">
                  Point camera at parent&apos;s QR code
                </p>
              </>
            )}
          </div>
        )}

        {scanState === "processing" && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Processing check-in...</p>
          </div>
        )}

        {scanState === "success" && (
          <div className="text-center bg-white rounded-2xl p-8 w-full max-w-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-green-900 font-bold text-xl mb-1">Checked In! 🎉</h3>
            <p className="text-green-700 font-semibold text-lg">{parentName}</p>
            <p className="text-green-500 text-sm mt-2">{message}</p>
            <div className="bg-green-50 rounded-xl p-3 mt-4">
              <p className="text-green-600 font-bold text-2xl">+10 pts</p>
              <p className="text-green-400 text-xs">Points awarded</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleScanAgain}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl"
              >
                Scan Next
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="flex-1 border border-green-200 text-green-600 font-semibold py-3 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {scanState === "duplicate" && (
          <div className="text-center bg-white rounded-2xl p-8 w-full max-w-sm">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-yellow-800 font-bold text-xl mb-1">Already Checked In</h3>
            <p className="text-yellow-600 text-sm mt-2">{message}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleScanAgain}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl"
              >
                Scan Another
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="flex-1 border border-green-200 text-green-600 font-semibold py-3 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {scanState === "error" && (
          <div className="text-center bg-white rounded-2xl p-8 w-full max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-red-800 font-bold text-xl mb-1">Error</h3>
            <p className="text-red-600 text-sm mt-2">{message}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleScanAgain}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="flex-1 border border-green-200 text-green-600 font-semibold py-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

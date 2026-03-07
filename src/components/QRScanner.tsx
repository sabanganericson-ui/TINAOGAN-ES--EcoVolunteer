"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastScannedRef = useRef<string>("");
  const isActiveRef = useRef<boolean>(true);
  const cameraErrorRef = useRef<string>("");

  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [message, setMessage] = useState("");
  const [parentName, setParentName] = useState("");
  const [cameraError, setCameraError] = useState("");

  const stopCamera = useCallback(() => {
    isActiveRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    isActiveRef.current = true;

    const tick = () => {
      if (!isActiveRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data !== lastScannedRef.current) {
        lastScannedRef.current = code.data;
        try {
          const parsed = JSON.parse(code.data);
          if (parsed.type === "volunteer-checkin" && parsed.userId) {
            isActiveRef.current = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }
            handleCheckin(parsed.userId);
            return;
          }
        } catch {
          // Not a valid QR code for this app
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!isActiveRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .then(() => {
              animFrameRef.current = requestAnimationFrame(tick);
            })
            .catch(() => {
              cameraErrorRef.current = "Could not start video stream.";
            });
        }
      })
      .catch(() => {
        cameraErrorRef.current =
          "Camera access denied. Please allow camera access and try again.";
        setCameraError(cameraErrorRef.current);
      });

    return () => {
      isActiveRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [handleCheckin]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleScanAgain = () => {
    lastScannedRef.current = "";
    setScanState("scanning");
    setMessage("");
    setParentName("");

    isActiveRef.current = true;

    const tick = () => {
      if (!isActiveRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data !== lastScannedRef.current) {
        lastScannedRef.current = code.data;
        try {
          const parsed = JSON.parse(code.data);
          if (parsed.type === "volunteer-checkin" && parsed.userId) {
            isActiveRef.current = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }
            handleCheckin(parsed.userId);
            return;
          }
        } catch {
          // Not a valid QR code for this app
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            animFrameRef.current = requestAnimationFrame(tick);
          });
        }
      })
      .catch(() => {
        setCameraError("Camera access denied.");
      });
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
          onClick={handleClose}
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
          <>
            {cameraError ? (
              <div className="text-center">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-white text-sm">{cameraError}</p>
              </div>
            ) : (
              <div className="relative w-full max-w-sm">
                <video
                  ref={videoRef}
                  className="w-full rounded-2xl"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
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
              </div>
            )}
          </>
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
                onClick={handleClose}
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
                onClick={handleClose}
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
                onClick={handleClose}
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

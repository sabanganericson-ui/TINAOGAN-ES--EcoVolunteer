"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  userId: number;
  userName: string;
}

export default function QRCodeDisplay({ userId, userName }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Encode userId as the QR data
      const qrData = JSON.stringify({ userId, type: "volunteer-checkin" });
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    }
  }, [userId]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
        <canvas ref={canvasRef} className="rounded-xl" />
      </div>
      <p className="text-green-600 text-sm font-medium mt-3">{userName}</p>
      <p className="text-green-400 text-xs">ID: #{userId}</p>
    </div>
  );
}

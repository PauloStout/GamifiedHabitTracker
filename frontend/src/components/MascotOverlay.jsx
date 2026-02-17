import React, { useEffect } from "react";

export default function MascotOverlay({ src, message, duration = 10000, onClose }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 1000,
        animation: "pop 0.5s ease-out",
      }}
    >
      <img
        src={src}
        alt="Mascot"
        style={{ width: 100, height: 100, objectFit: "contain" }}
      />

      {message && (
        <div
          style={{
            background: "white",
            padding: "10px 14px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            maxWidth: "220px",
            fontWeight: "500",
          }}
        >
          {message}
        </div>
      )}

      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ShareWidget({ businessId, businessName }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const chatUrl = `${import.meta.env.VITE_APP_URL || window.location.origin}/chat/${businessId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(chatUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 40, 20, size - 80, size - 80);
      ctx.fillStyle = "#374151";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Scan to chat with ${businessName}`, size / 2, size - 20);

      const link = document.createElement("a");
      link.download = `${businessName}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Share Your Chatbot
      </h2>

      {/* Link Row */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-600 truncate">
          {chatUrl}
        </div>
        <button
          onClick={handleCopy}
          className={`px-4 py-2.5 rounded-xl text-xs font-medium transition ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-gray-900 text-white hover:bg-gray-700"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Open in new tab */}
      <a
        href={chatUrl}
        target="_blank"
        rel="noreferrer"
        className="block w-full text-center border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-medium hover:bg-gray-50 transition mb-5"
      >
        Open Chat Page
      </a>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        <p className="text-xs text-gray-500 mb-3">
          Print this QR code for your shop counter
        </p>
        <div
          ref={qrRef}
          className="bg-white p-3 rounded-xl border border-gray-200"
        >
          <QRCodeSVG
            value={chatUrl}
            size={160}
            bgColor="#ffffff"
            fgColor="#111827"
            level="M"
          />
        </div>
        <button
          onClick={handleDownloadQR}
          className="mt-3 flex items-center gap-2 text-xs text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
        >
          Download QR Code
        </button>
      </div>
    </div>
  );
}

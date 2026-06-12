import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ShareWidget({ businessId, businessName }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showLink, setShowLink] = useState(false);
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
      ctx.fillText(
        `Scan to chat with ${businessName}`,
        size / 2,
        size - 20
      );

      const link = document.createElement("a");
      link.download = `${businessName}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(svgData);
  };

  return (
  <>
    <div className="space-y-6">

      {/* Share Information */}
      <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">
          Share Information
        </h2>

        <p className="text-zinc-400 leading-relaxed">
          Customers can access your AI assistant by scanning a QR code
          or opening the chatbot link directly.
        </p>

        <div className="mt-4 text-sm text-zinc-500">
          • Shop Counters
          <br />
          • Business Cards
          <br />
          • Websites
          <br />
          • Customer Support Pages
        </div>
      </div>

      {/* Chatbot Access */}
      <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Chatbot Access
        </h2>

        <p className="text-zinc-400 mb-4">
          Share your chatbot with customers using a secure link or QR code.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
          onClick={() => setShowLink(true)}
          className="text-center border border-zinc-700 py-3 rounded-lg text-zinc-300 hover:border-purple-500 transition">
            Share Link
          </button>
          <a
            href={chatUrl}
            target="_blank"
            rel="noreferrer"
            className="text-center border border-zinc-700 py-3 rounded-lg text-zinc-300 hover:border-purple-500 transition"
          >
            Open Chat
          </a>
          <button
            onClick={() => setShowQR(true)}
            className="text-center border border-zinc-700 py-3 rounded-lg text-zinc-300 hover:border-purple-500 transition" >
              Show QR
          </button>
        </div>
      </div>
    </div>

    {/* Share Link Modal */}
    {showLink && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 w-full max-w-md">

          <h2 className="text-xl font-semibold text-white mb-3">
            Share Link
          </h2>

          <p className="text-zinc-400 mb-4">
            Share this chatbot link with customers.
          </p>

          <div className="bg-[#09090B] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 break-all mb-5">
            {chatUrl}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className={`flex-1 py-3 rounded-lg transition ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={() => setShowLink(false)}
              className="flex-1 border border-zinc-700 text-zinc-300 rounded-lg py-3 hover:border-zinc-500 transition"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    )}

    {/* QR Modal */}
    {showQR && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 w-full max-w-md">

          <h2 className="text-xl font-semibold text-white mb-3">
            QR Access
          </h2>

          <p className="text-zinc-400 mb-6">
            Customers can scan this QR code to start chatting instantly.
          </p>

          <div className="flex justify-center mb-6">
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-xl"
            >
              <QRCodeSVG
                value={chatUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#111827"
                level="M"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadQR}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 transition"
            >
              Download QR
            </button>

            <button
              onClick={() => setShowQR(false)}
              className="flex-1 border border-zinc-700 text-zinc-300 rounded-lg py-3 hover:border-zinc-500 transition"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    )}
  </>
);
}
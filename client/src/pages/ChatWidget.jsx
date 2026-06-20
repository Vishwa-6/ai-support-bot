import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// ─── Typing Animation ─────────────────────────────────────
const TypingIndicator = ({ initial }) => (
  <div className="flex items-start gap-3 px-4 py-2">
    <div className="flex items-center gap-1 py-3">
      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  </div>
);

// ─── Message Component ────────────────────────────────────
const Message = ({ message, businessInitial }) => {
  const isUser = message.role === "customer";

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1">
        <div className="max-w-[75%] sm:max-w-[60%]">
          <div className="bg-[#111113] border border-purple-500/40 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex px-4 py-1">
      <div className="max-w-[75%] sm:max-w-[65%]">
        <div className={`bg-[#111113] border border-purple-500/40 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed ${message.isError ? "text-red-400" : "text-white"}`}>
          {message.text}
        </div>
      </div>
    </div>
  );
};

// ─── Suggestion Pill ──────────────────────────────────────
const SuggestionPill = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="text-xs border border-purple-500/40 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 transition whitespace-nowrap"
  >
    {text}
  </button>
);

// ─── Main Chat Widget ─────────────────────────────────────
export default function ChatWidget() {
  const { businessId } = useParams();

  // Retrieve session storage values
  const storedName = sessionStorage.getItem(`chat_customer_name_${businessId}`) || "";
  const storedSessionId = sessionStorage.getItem(`chat_session_id_${businessId}`) || "";
  const storedMessages = sessionStorage.getItem(`chat_messages_${businessId}`);

  const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [customerName, setCustomerName] = useState(storedName);
  const [sessionId, setSessionId] = useState(storedSessionId);
  const [nameSubmitted, setNameSubmitted] = useState(!!storedName && !!storedSessionId);
  const [nameInput, setNameInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const businessInitial = businessName ? businessName.charAt(0).toUpperCase() : "S";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (nameSubmitted && messages.length > 0) {
      sessionStorage.setItem(`chat_messages_${businessId}`, JSON.stringify(messages));
    }
  }, [messages, nameSubmitted, businessId]);

  useEffect(() => {
    const fetchBusinessName = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/business/${businessId}`
        );
        setBusinessName(res.data.businessName);
      } catch {
        setBusinessName("Support Chat");
      }
    };
    fetchBusinessName();
  }, [businessId]);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    const sessId = Date.now() + Math.random().toString(36).substring(2, 9);

    setCustomerName(name);
    setSessionId(sessId);
    setNameSubmitted(true);

    sessionStorage.setItem(`chat_customer_name_${businessId}`, name);
    sessionStorage.setItem(`chat_session_id_${businessId}`, sessId);

    const initialMessages = [
      {
        id: Date.now(),
        role: "bot",
        text: `Hi ${name}! How can I help you today?`,
        time: getTime(),
      },
    ];
    setMessages(initialMessages);
  };

  const handleSend = async (overrideText) => {
    const question = (overrideText || input).trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: "customer",
      text: question,
      time: getTime(),
    }]);
    setInput("");
    setLoading(true);

    // reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/${businessId}`,
        { question, customerName, sessionId }
      );

      const botText = res.data.rateLimited
        ? "⏳ Our AI is currently busy. Please try again in 5 minutes."
        : res.data.answer;

      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "bot",
        text: botText,
        time: getTime(),
        isError: res.data.rateLimited,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "bot",
        text: err.response?.status === 503
          ? "⏳ Our AI is currently busy. Please try again in 5 minutes."
          : "Something went wrong. Please try again.",
        time: getTime(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    if (window.confirm("Restart the conversation? This will clear history.")) {
      sessionStorage.removeItem(`chat_customer_name_${businessId}`);
      sessionStorage.removeItem(`chat_session_id_${businessId}`);
      sessionStorage.removeItem(`chat_messages_${businessId}`);
      setCustomerName("");
      setSessionId("");
      setMessages([]);
      setNameSubmitted(false);
      setNameInput("");
    }
  };

  const handleDownloadPDF = () => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const transcript = messages
      .map((msg) => {
        const sender = msg.role === "customer" ? customerName : "AI Assistant";
        return `<tr>
          <td style="padding:8px 12px;vertical-align:top;white-space:nowrap;color:#888;font-size:12px;">${msg.time || ""}</td>
          <td style="padding:8px 12px;vertical-align:top;font-weight:600;white-space:nowrap;color:${msg.role === "customer" ? "#7c3aed" : "#059669"};font-size:13px;">${sender}</td>
          <td style="padding:8px 12px;vertical-align:top;color:#333;font-size:13px;line-height:1.6;">${msg.text}</td>
        </tr>`;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Chat Transcript - ${businessName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #1a1a1a; padding: 40px; }
          .header { border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 24px; }
          .header h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; }
          .header p { font-size: 13px; color: #666; margin-top: 4px; }
          .meta { display: flex; gap: 32px; margin-top: 12px; }
          .meta span { font-size: 12px; color: #888; }
          .meta strong { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          tr:nth-child(even) td { background: #fafafa; }
          tr td { border-bottom: 1px solid #f0f0f0; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 11px; color: #aaa; }
          @media print {
            body { padding: 20px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${businessName} — Chat Transcript</h1>
          <p>Conversation log from your AI support assistant</p>
          <div class="meta">
            <span>Customer: <strong>${customerName}</strong></span>
            <span>Date: <strong>${today}</strong></span>
            <span>Messages: <strong>${messages.length}</strong></span>
          </div>
        </div>
        <table>${transcript}</table>
        <div class="footer">
          Powered by SupportNest AI &middot; Generated on ${today}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    }
  };

  // ── Name Entry Screen ─────────────────────────────────
  if (!nameSubmitted) {
    return (
      <div className="fixed inset-0 bg-[#09090B] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-white text-center">
              {businessName || "Loading..."}
            </h1>
            <p className="text-zinc-400 mt-2 text-center">
              AI-powered customer support - ask us anything
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="w-full bg-[#111113] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 transition rounded-xl py-3 font-medium text-white disabled:opacity-50">
              Start
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Powered by SupportNest AI
          </p>
        </div>
      </div>
    );
  }

  // ── Chat Screen ───────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col bg-[#09090B] max-w-2xl mx-auto">

      {/* Header - always fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#09090B]">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">
            {businessName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={handleDownloadPDF}
              className="text-xs text-zinc-400 hover:text-purple-400 border border-zinc-800 hover:border-purple-500/30 px-2 py-1 rounded transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Save PDF
            </button>
          )}
          <button
            onClick={handleRestart}
            className="text-xs text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 px-2 py-1 rounded transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Messages - only this scrolls */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} businessInitial={businessInitial} />
        ))}

        {loading && <TypingIndicator initial={businessInitial} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-zinc-800 bg-[#09090B] px-4 py-4">

        <div className="flex items-end gap-3">

          <div className="flex-1 bg-[#111113] rounded-2xl px-4 py-3 border border-zinc-700 focus-within:border-white focus-within:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-200">

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              rows={1}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none py-1 max-h-28"
            />

          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="
        w-12
        h-12
        rounded-full
        bg-black
        border
        border-zinc-700
        flex
        items-center
        justify-center
        transition-all
        duration-200
        hover:border-white
        hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]
        disabled:opacity-30
        disabled:cursor-not-allowed
        flex-shrink-0
      "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>

        </div>

        <p className="text-xs text-zinc-500 text-center mt-3">
          AI may make mistakes - verify important info directly
        </p>

      </div>

    </div>
  );
}

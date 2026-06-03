import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// ─── Typing Animation ─────────────────────────────────────
const TypingIndicator = ({ initial }) => (
  <div className="flex items-start gap-3 px-4 py-2">
    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
      {initial}
    </div>
    <div className="flex items-center gap-1 py-3">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
          <div className="border border-gray-200 text-gray-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed bg-white">
            {message.text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-1">
      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5">
        {businessInitial}
      </div>
      <div className="max-w-[75%] sm:max-w-[65%]">
        <div className={`text-sm leading-relaxed py-1 ${message.isError ? "text-red-500" : "text-gray-800"}`}>
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
    className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 transition whitespace-nowrap"
  >
    {text}
  </button>
);

// ─── Main Chat Widget ─────────────────────────────────────
export default function ChatWidget() {
  const { businessId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const businessInitial = businessName ? businessName.charAt(0).toUpperCase() : "S";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    setCustomerName(name);
    setNameSubmitted(true);
    setMessages([
      {
        id: Date.now(),
        role: "bot",
        text: `Hi ${name}! How can I help you today?`,
        time: getTime(),
      },
    ]);
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
        { question, customerName }
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

  // ── Name Entry Screen ─────────────────────────────────
  if (!nameSubmitted) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl font-semibold mb-4">
              {businessInitial}
            </div>
            <h1 className="text-xl font-semibold text-gray-900 text-center">
              {businessName || "Loading..."}
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              AI-powered support - ask us anything
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
            >
              Start conversation
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Powered by AI Support Bot
          </p>
        </div>
      </div>
    );
  }

  // ── Chat Screen ───────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col bg-white max-w-2xl mx-auto">

      {/* Header - always fixed at top */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {businessInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {businessName}
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400">Online</span>
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

      {/* Input Bar - always fixed at bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-gray-300 transition">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none py-1 max-h-28"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
          >
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          AI may make mistakes - verify important info directly
        </p>
      </div>

    </div>
  );
}

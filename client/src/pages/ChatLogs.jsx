import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChatLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const business = JSON.parse(localStorage.getItem("business"));

  useEffect(() => {
    const fetchLogs = async () => {
      if (!business?.id || !token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chat/logs/${business.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [business?.id, token]);

  const filtered = logs.filter(
    (log) =>
      log.question.toLowerCase().includes(search.toLowerCase()) ||
      log.answer.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Chat Logs</h1>
          <p className="text-xs text-gray-400">{logs.length} conversations</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Conversations</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">
              {new Set(logs.map((l) => l.customerName)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">Unique Visitors</p>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Loading conversations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm mb-3">No conversations</p>
            <p className="text-gray-400 text-sm">
              {search ? "No results found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) => (
              <div
                key={log._id}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                {/* Customer + time */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-semibold text-amber-700">
                      {log.customerName?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {log.customerName || "Anonymous"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(log.createdAt)}
                  </span>
                </div>

                {/* Question */}
                <div className="flex justify-end mb-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-gray-700 max-w-[80%]">
                    {log.question}
                  </div>
                </div>

                {/* Answer */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5">
                    AI
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {log.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

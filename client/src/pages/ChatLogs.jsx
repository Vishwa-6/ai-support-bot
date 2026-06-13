import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChatLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState({});

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

  // Group logs by Session ID (or fallback legacy criteria)
  const groupedSessions = useMemo(() => {
    const sessions = {};

    logs.forEach((log) => {
      const sessionKey =
        log.sessionId ||
        `legacy-${log.customerName}-${new Date(log.createdAt).toDateString()}`;

      if (!sessions[sessionKey]) {
        sessions[sessionKey] = {
          sessionKey,
          sessionId: log.sessionId || "",
          customerName: log.customerName || "Anonymous",
          messages: [],
          lastActive: log.createdAt,
        };
      }

      sessions[sessionKey].messages.push(log);

      if (new Date(log.createdAt) > new Date(sessions[sessionKey].lastActive)) {
        sessions[sessionKey].lastActive = log.createdAt;
      }
    });

    // Sort messages in chronological order inside each session
    Object.values(sessions).forEach((session) => {
      session.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    // Sort sessions by lastActive time descending
    return Object.values(sessions).sort(
      (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
    );
  }, [logs]);

  // Filter based on search input & starred state
  const filteredSessions = useMemo(() => {
    let result = groupedSessions;

    if (starredOnly) {
      result = result.filter((session) =>
        session.messages.some((m) => m.isStarred)
      );
    }

    const query = search.toLowerCase().trim();
    if (!query) return result;

    return result.filter((session) => {
      const nameMatch = session.customerName.toLowerCase().includes(query);
      const contentMatch = session.messages.some(
        (m) =>
          m.question.toLowerCase().includes(query) ||
          m.answer.toLowerCase().includes(query)
      );
      return nameMatch || contentMatch;
    });
  }, [groupedSessions, search, starredOnly]);

  const toggleSession = (sessionKey) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionKey]: !prev[sessionKey],
    }));
  };

  const handleToggleStar = async (logId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/chat/logs/${logId}/star`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs((prev) =>
        prev.map((log) =>
          log._id === logId ? { ...log, isStarred: res.data.isStarred } : log
        )
      );
    } catch (err) {
      console.error("Star toggle error:", err);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/chat/logs/${logId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs((prev) => prev.filter((log) => log._id !== logId));
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  const handleDeleteSession = async (sessionKey, sessionId) => {
    if (!window.confirm("Delete this entire conversation thread?")) return;
    try {
      if (sessionId) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/chat/logs/session/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Fallback for legacy items: delete their log records individually
        const session = groupedSessions.find((s) => s.sessionKey === sessionKey);
        if (session) {
          for (const msg of session.messages) {
            await axios.delete(
              `${import.meta.env.VITE_API_URL}/api/chat/logs/${msg._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }
      }

      // Remove local logs that belong to the deleted session
      setLogs((prev) => {
        const session = groupedSessions.find((s) => s.sessionKey === sessionKey);
        if (!session) return prev;
        const msgIds = session.messages.map((m) => m._id);
        return prev.filter((log) => !msgIds.includes(log._id));
      });
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 hover:text-white p-1 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold">Conversations</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {groupedSessions.length} total sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Search & Star Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search visitor names or message content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111113] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition duration-200 ${
              starredOnly
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-[#111113] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
            }`}
          >
            <span>{starredOnly ? "★" : "☆"}</span>
            <span>Starred Only</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#111113] rounded-2xl border border-zinc-800 p-5">
            <p className="text-3xl font-bold text-white">
              {groupedSessions.length}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Total Chat Sessions</p>
          </div>
          <div className="bg-[#111113] rounded-2xl border border-zinc-800 p-5">
            <p className="text-3xl font-bold text-white">
              {logs.length}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Total Queries Answered</p>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            <div className="animate-pulse">Loading conversations...</div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 bg-[#111113] rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-sm font-medium mb-1">
              No conversations found
            </p>
            <p className="text-zinc-600 text-xs">
              {search || starredOnly
                ? "Try adjusting your filters or search terms."
                : "Your AI assistant is ready. Share your link to start getting logs!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const isExpanded = !!expandedSessions[session.sessionKey];
              const msgCount = session.messages.length;
              const lastMsg = session.messages[msgCount - 1];

              return (
                <div
                  key={session.sessionKey}
                  className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  {/* Session Accordion Header */}
                  <div
                    onClick={() => toggleSession(session.sessionKey)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-400 flex-shrink-0">
                        {session.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">
                            {session.customerName}
                          </span>
                          <span className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                            {msgCount} {msgCount === 1 ? "query" : "queries"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-1">
                          {!isExpanded && lastMsg
                            ? `Last: ${lastMsg.question}`
                            : `Conversation started`}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-3 pl-4 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-zinc-500">
                        {formatDate(session.lastActive)}
                      </span>
                      <button
                        onClick={() =>
                          handleDeleteSession(session.sessionKey, session.sessionId)
                        }
                        className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-zinc-800 rounded-lg transition"
                        title="Delete entire session"
                      >
                        🗑️
                      </button>
                      <div
                        onClick={() => toggleSession(session.sessionKey)}
                        className="cursor-pointer p-1.5 hover:bg-zinc-800 rounded-lg"
                      >
                        <svg
                          className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Session Accordion Body */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 bg-[#09090B]/40 px-5 py-4 space-y-4">
                      {session.messages.map((msg, idx) => (
                        <div key={msg._id} className="space-y-3">
                          {/* Query from User */}
                          <div className="flex justify-end">
                            <div className="max-w-[85%] sm:max-w-[75%] bg-[#18181B] border border-zinc-800 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-zinc-300">
                              <p className="leading-relaxed">{msg.question}</p>
                              
                              {/* Message actions footer */}
                              <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleToggleStar(msg._id)}
                                    className={`hover:text-amber-400 transition font-medium flex items-center gap-0.5 ${
                                      msg.isStarred
                                        ? "text-amber-400"
                                        : "text-zinc-500"
                                    }`}
                                    title="Star this question"
                                  >
                                    {msg.isStarred ? "★ Starred" : "☆ Star"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLog(msg._id)}
                                    className="hover:text-red-400 text-zinc-500 transition font-medium"
                                    title="Delete query record"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                                <span>{formatDate(msg.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Response from AI */}
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                              AI
                            </div>
                            <div className="max-w-[85%] sm:max-w-[75%] bg-purple-950/20 border border-purple-500/20 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-zinc-300">
                              <p className="leading-relaxed">{msg.answer}</p>
                              <p className="text-[10px] text-zinc-500 mt-1.5">
                                {formatDate(msg.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Separator if not last message in thread */}
                          {idx < msgCount - 1 && (
                            <div className="border-b border-zinc-850 my-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

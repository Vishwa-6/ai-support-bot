import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Unresolved FAQ state variables
  const [unresolvedLogs, setUnresolvedLogs] = useState([]);
  const [unresolvedAnswers, setUnresolvedAnswers] = useState({});

  const token = localStorage.getItem("token");
  const business = JSON.parse(localStorage.getItem("business"));
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchChunks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/knowledge`, { headers });
      setChunks(res.data.chunks);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [headers]);

  // Load unresolved questions from logs
  const fetchUnresolved = useCallback(async () => {
    if (!token || !business?.id) return;
    try {
      const res = await axios.get(`${API}/api/chat/unresolved/${business.id}`, {
        headers,
      });
      setUnresolvedLogs(res.data.unresolvedLogs);
    } catch (err) {
      console.error("Fetch unresolved logs error:", err);
    }
  }, [headers, business?.id, token]);

  useEffect(() => {
    let ignore = false;

    const loadChunksAndLogs = async () => {
      try {
        const res = await axios.get(`${API}/api/knowledge`, { headers });
        if (!ignore) {
          setChunks(res.data.chunks);
        }
        
        // Fetch unresolved logs
        if (business?.id && token) {
          const unresolvedRes = await axios.get(
            `${API}/api/chat/unresolved/${business.id}`,
            { headers }
          );
          if (!ignore) {
            setUnresolvedLogs(unresolvedRes.data.unresolvedLogs);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setFetching(false);
        }
      }
    };

    loadChunksAndLogs();

    return () => {
      ignore = true;
    };
  }, [headers, business?.id, token]);

  const handleUpload = async () => {
    if (text.trim().length < 10) {
      setError("Please enter at least a few sentences");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API}/api/knowledge/upload`,
        { text },
        { headers }
      );
      setSuccess(`Saved! Split into ${res.data.chunksCount} chunks.`);
      setText("");
      fetchChunks();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMore = async () => {
    if (text.trim().length < 10) {
      setError("Please enter at least a few sentences");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API}/api/knowledge/add-more`,
        { text },
        { headers }
      );
      setSuccess(
        `Added ${res.data.addedChunks} new chunks! ${
          res.data.skippedDuplicates > 0
            ? `(${res.data.skippedDuplicates} duplicate(s) skipped)`
            : ""
        }`
      );
      setText("");
      fetchChunks();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Solve unresolved question and save to Knowledge Base
  const handleResolveFAQ = async (logId, question, answerText) => {
    if (!answerText.trim() || answerText.trim().length < 3) {
      alert("Please write a valid answer (minimum 3 characters).");
      return;
    }

    try {
      const combinedText = `Question: ${question}\nAnswer: ${answerText.trim()}`;
      
      // Save answering chunk into Knowledge Base
      await axios.post(
        `${API}/api/knowledge/add-more`,
        { text: combinedText },
        { headers }
      );

      // Flag the query log as resolved (isUnresolved: false)
      await axios.put(
        `${API}/api/chat/logs/${logId}/resolve`,
        {},
        { headers }
      );

      // Filter local state list
      setUnresolvedLogs((prev) => prev.filter((log) => log._id !== logId));
      setUnresolvedAnswers((prev) => {
        const updated = { ...prev };
        delete updated[logId];
        return updated;
      });

      setSuccess("Answer trained and added to Knowledge Base!");
      setTimeout(() => setSuccess(""), 4000);

      // Reload chunks
      fetchChunks();
    } catch (err) {
      console.error("Resolve FAQ error:", err);
      alert("Failed to submit answer. Please try again.");
    }
  };

  const startEdit = (chunk) => {
    setEditingId(chunk._id);
    setEditText(chunk.text);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (chunkId) => {
    if (editText.trim().length < 3) return;
    setEditLoading(true);
    try {
      await axios.put(
        `${API}/api/knowledge/${chunkId}`,
        { text: editText },
        { headers }
      );
      setChunks((prev) =>
        prev.map((c) => (c._id === chunkId ? { ...c, text: editText } : c))
      );
      setEditingId(null);
      setEditText("");
      setSuccess("Chunk updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setEditLoading(false);
    }
  };

  const deleteChunk = async (chunkId) => {
    if (!window.confirm("Delete this chunk?")) return;
    setDeleteLoadingId(chunkId);
    try {
      await axios.delete(`${API}/api/knowledge/${chunkId}`, { headers });
      setChunks((prev) => prev.filter((c) => c._id !== chunkId));
      setSuccess("Chunk deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete chunk");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm animate-pulse">
          Loading your knowledge base...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Add your business info - AI uses this to answer customer questions
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-purple-400 hover:text-purple-300 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Global status alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            Add / Update Business Info
          </h2>

          <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 mb-4 text-xs text-purple-400">
            Include services, prices, timings, location, contact, FAQs -
            anything your customers ask about.
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Type your business information here..."
            rows={8}
            className="w-full bg-[#09090B] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none transition"
          />

          <div className="flex justify-between items-center mt-2 mb-4">
            <p className="text-xs text-zinc-500">{text.length} characters</p>
            {chunks.length > 0 && (
              <span className="text-xs bg-purple-950/30 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full">
                {chunks.length} chunks saved
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Save & Replace All"}
            </button>
            <button
              onClick={handleAddMore}
              disabled={loading}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Add More"}
            </button>
          </div>

          <div className="flex gap-3 mt-2">
            <p className="flex-1 text-xs text-center text-zinc-500">
              Replaces all existing info
            </p>
            <p className="flex-1 text-xs text-center text-zinc-500">
              Adds to existing info
            </p>
          </div>
        </div>

        {/* Unresolved Questions Dashboard FAQ Refiner */}
        {unresolvedLogs.length > 0 && (
          <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <span>💡</span> Unanswered Customer Questions ({unresolvedLogs.length})
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              The AI was unable to answer these questions based on your current knowledge base. Fill in answers below to train the AI instantly.
            </p>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {unresolvedLogs.map((log) => (
                <div
                  key={log._id}
                  className="bg-[#09090B] border border-zinc-800 rounded-xl p-4 space-y-3"
                >
                  <div className="text-sm">
                    <span className="text-zinc-500 text-xs block mb-1">
                      Visitor "{log.customerName}" asked:
                    </span>
                    <p className="font-semibold text-zinc-200">
                      "{log.question}"
                    </p>
                  </div>
                  <div>
                    <textarea
                      value={unresolvedAnswers[log._id] || ""}
                      onChange={(e) =>
                        setUnresolvedAnswers((prev) => ({
                          ...prev,
                          [log._id]: e.target.value,
                        }))
                      }
                      placeholder="Type the answer here to train the AI..."
                      rows={2}
                      className="w-full bg-[#111113] border border-zinc-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none transition"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={async () => {
                        if (window.confirm("Dismiss this question? It will be removed from this list.")) {
                          try {
                            await axios.put(
                              `${API}/api/chat/logs/${log._id}/resolve`,
                              {},
                              { headers }
                            );
                            setUnresolvedLogs((prev) =>
                              prev.filter((l) => l._id !== log._id)
                            );
                          } catch (err) {
                            console.error("Resolve error:", err);
                          }
                        }
                      }}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-1.5 rounded-lg transition"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() =>
                        handleResolveFAQ(
                          log._id,
                          log.question,
                          unresolvedAnswers[log._id] || ""
                        )
                      }
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                    >
                      Train AI Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {chunks.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">
              Saved Info Chunks ({chunks.length})
            </h2>
            <div className="space-y-3">
              {chunks.map((chunk, index) => (
                <div
                  key={chunk._id}
                  className="bg-[#111113] border border-zinc-800 rounded-xl p-4"
                >
                  {editingId === chunk._id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        className="w-full bg-[#09090B] border border-purple-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(chunk._id)}
                          disabled={editLoading}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                        >
                          {editLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3 flex-1">
                        <span className="text-xs font-bold text-zinc-500 mt-1 min-w-fit">
                          #{index + 1}
                        </span>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {chunk.text}
                        </p>
                      </div>
                      <div className="flex gap-2 min-w-fit">
                        <button
                          onClick={() => startEdit(chunk)}
                          className="text-xs bg-[#09090B] border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteChunk(chunk._id)}
                          disabled={deleteLoadingId === chunk._id}
                          className="text-xs bg-[#09090B] border border-zinc-850 hover:border-red-500/30 text-zinc-400 hover:text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {deleteLoadingId === chunk._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {chunks.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-500 bg-[#111113] border border-zinc-800 rounded-2xl">
            <p className="text-sm mb-2">No saved chunks</p>
            <p className="text-xs text-zinc-600">
              No info added yet. Type your business details above and click Save
              or Add More!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

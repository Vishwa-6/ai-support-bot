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

  const token = localStorage.getItem("token");
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

  useEffect(() => {
    let ignore = false;

    const loadChunks = async () => {
      try {
        const res = await axios.get(`${API}/api/knowledge`, { headers });
        if (!ignore) {
          setChunks(res.data.chunks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) {
          setFetching(false);
        }
      }
    };

    loadChunks();

    return () => {
      ignore = true;
    };
  }, [headers]);

  const handleUpload = async () => {
    if (text.trim().length < 10) { setError("Please enter at least a few sentences"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await axios.post(`${API}/api/knowledge/upload`, { text }, { headers });
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
    if (text.trim().length < 10) { setError("Please enter at least a few sentences"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await axios.post(`${API}/api/knowledge/add-more`, { text }, { headers });
      setSuccess(`Added ${res.data.addedChunks} new chunks! ${res.data.skippedDuplicates > 0 ? `(${res.data.skippedDuplicates} duplicate(s) skipped)` : ""}`);
      setText("");
      fetchChunks();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (chunk) => { setEditingId(chunk._id); setEditText(chunk.text); };
  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  const saveEdit = async (chunkId) => {
    if (editText.trim().length < 3) return;
    setEditLoading(true);
    try {
      await axios.put(`${API}/api/knowledge/${chunkId}`, { text: editText }, { headers });
      setChunks((prev) => prev.map((c) => c._id === chunkId ? { ...c, text: editText } : c));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Knowledge Base</h1>
            <p className="text-gray-500 text-sm mt-1">Add your business info - AI uses this to answer customer questions</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-blue-600 hover:underline">Back</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Add / Update Business Info</h2>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-600">
            Include services, prices, timings, location, contact, FAQs - anything your customers ask about.
          </div>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); setSuccess(""); }}
            placeholder="Type your business information here..."
            rows={8}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="flex justify-between items-center mt-2 mb-4">
            <p className="text-xs text-gray-400">{text.length} characters</p>
            {chunks.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">{chunks.length} chunks saved</span>
            )}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-3">{success}</div>}

          <div className="flex gap-3">
            <button onClick={handleUpload} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Processing..." : "Save & Replace All"}
            </button>
            <button onClick={handleAddMore} disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50">
              {loading ? "Processing..." : "Add More"}
            </button>
          </div>

          <div className="flex gap-3 mt-2">
            <p className="flex-1 text-xs text-center text-gray-400">Replaces all existing info</p>
            <p className="flex-1 text-xs text-center text-gray-400">Adds to existing info</p>
          </div>
        </div>

        {chunks.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Saved Info Chunks ({chunks.length})</h2>
            <div className="space-y-3">
              {chunks.map((chunk, index) => (
                <div key={chunk._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  {editingId === chunk._id ? (
                    <div>
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4} className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(chunk._id)} disabled={editLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                          {editLoading ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3 flex-1">
                        <span className="text-xs font-bold text-gray-300 mt-1 min-w-fit">#{index + 1}</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{chunk.text}</p>
                      </div>
                      <div className="flex gap-2 min-w-fit">
                        <button onClick={() => startEdit(chunk)} className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-500 px-3 py-1.5 rounded-lg transition">✏️ Edit</button>
                        <button onClick={() => deleteChunk(chunk._id)} disabled={deleteLoadingId === chunk._id} className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
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
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm mb-3">No saved chunks</p>
            <p className="text-sm">No info added yet. Type your business details above and hit Save!</p>
          </div>
        )}

      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import ShareWidget from "../components/ShareWidget";

export default function Dashboard() {
  const navigate = useNavigate();
  const business = JSON.parse(localStorage.getItem("business"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {business?.businessName}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Welcome back, {business?.ownerName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate("/knowledge")}
            className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-sm transition active:scale-95"
          >
            <h2 className="text-sm font-semibold text-gray-800">Knowledge Base</h2>
            <p className="text-xs text-gray-400 mt-1">
              Manage your business info
            </p>
          </div>

          <div
            onClick={() => navigate("/logs")}
            className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-sm transition active:scale-95"
          >
            <h2 className="text-sm font-semibold text-gray-800">Chat Logs</h2>
            <p className="text-xs text-gray-400 mt-1">
              View customer conversations
            </p>
          </div>
        </div>

        {/* Share Widget */}
        <ShareWidget
          businessId={business?.id}
          businessName={business?.businessName}
        />

      </div>
    </div>
  );
}

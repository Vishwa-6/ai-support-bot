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
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              SupportNest
            </h1>

            <p className="text-zinc-400 text-sm mt-1">
              Business AI Support Workspace
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="border border-zinc-700 px-4 py-2 rounded-lg text-sm hover:border-red-500 hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            {business?.businessName}
          </h2>

          <p className="text-zinc-400 mt-1">
            Welcome back, {business?.ownerName}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => navigate("/knowledge")}
            className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-purple-500/40 transition"
          >
            <h3 className="text-lg font-semibold mb-2">
              Knowledge Base
            </h3>

            <p className="text-zinc-400 text-sm">
              Manage the business information used by your AI assistant.
            </p>
          </div>

          <div
            onClick={() => navigate("/logs")}
            className="bg-[#111113] border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-purple-500/40 transition"
          >
            <h3 className="text-lg font-semibold mb-2">
              Chat Logs
            </h3>

            <p className="text-zinc-400 text-sm">
              Review customer conversations and support history.
            </p>
          </div>
        </div>

        {/* Share Assistant */}
        <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">
            Share Your Assistant
          </h3>

          <ShareWidget
            businessId={business?.id}
            businessName={business?.businessName}
          />
        </div>

      </div>
    </div>
  );
}
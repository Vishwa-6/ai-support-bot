
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Knowledge Base",
      description:
        "Upload business information that powers your AI assistant.",
    },
    {
      title: "Customer Support",
      description:
        "Provide instant responses to customer questions using AI.",
    },
    {
      title: "QR Sharing",
      description:
        "Share your chatbot through a unique link and QR code.",
    },
    {
      title: "Conversation Logs",
      description:
        "Track and review customer interactions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 sticky top-0 bg-[#09090B]/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            SupportNest
          </h1>

          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/login")}
              className="text-zinc-400 hover:text-white transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="text-zinc-400 hover:text-white transition"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-28 text-center">
        <p className="text-sm text-purple-400 font-medium mb-6">
          Business AI Support Platform
        </p>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-8">
          Customer support
          <br />
          that never sleeps.
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-zinc-400 leading-relaxed mb-12">
          Turn your business knowledge into an AI assistant that
          answers customer questions instantly.
          Help customers faster, reduce repetitive support work,
          and stay available 24/7.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
        >
          Get Started
        </button>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-semibold mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-zinc-800 rounded-2xl p-8 bg-[#111113] hover:border-purple-500/40 transition"
            >
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>

              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <h2 className="text-3xl font-semibold mb-12 text-center">
          How It Works
        </h2>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-md border border-zinc-800 rounded-xl p-6 bg-[#111113]">
            <h3 className="font-semibold mb-2">
              Create Account
            </h3>
            <p className="text-zinc-400 text-sm">
              Set up your business workspace.
            </p>
          </div>

          <div className="h-12 w-px bg-zinc-700"></div>

          <div className="w-full max-w-md border border-zinc-800 rounded-xl p-6 bg-[#111113]">
            <h3 className="font-semibold mb-2">
              Add Knowledge
            </h3>
            <p className="text-zinc-400 text-sm">
              Upload business information that powers your assistant.
            </p>
          </div>

          <div className="h-12 w-px bg-zinc-700"></div>

          <div className="w-full max-w-md border border-zinc-800 rounded-xl p-6 bg-[#111113]">
            <h3 className="font-semibold mb-2">
              Generate Chatbot
            </h3>
            <p className="text-zinc-400 text-sm">
              Receive a chatbot link and QR code.
            </p>
          </div>

          <div className="h-12 w-px bg-zinc-700"></div>

          <div className="w-full max-w-md border border-zinc-800 rounded-xl p-6 bg-[#111113]">
            <h3 className="font-semibold mb-2">
              Share Chatbot
            </h3>
            <p className="text-zinc-400 text-sm">
              Share chatbot link and QR code with your customers.
            </p>
          </div>

          <div className="h-12 w-px bg-zinc-700"></div>

          <div className="w-full max-w-md border border-zinc-800 rounded-xl p-6 bg-[#111113]">
            <h3 className="font-semibold mb-2">
              Support Customers
            </h3>
            <p className="text-zinc-400 text-sm">
              Customers get answers instantly, anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center">
        <p className="text-zinc-500 text-sm">
          © 2026 SupportNest
        </p>

        <p className="text-zinc-600 text-sm mt-2">
          Business AI Support Platform
        </p>
      </footer>
    </div>
  );
}

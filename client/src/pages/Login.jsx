import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";

const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address";
    }
    if (name === "password") {
      if (!value) error = "Password is required";
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async () => {
    const emailErr = !form.email.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Enter a valid email address" : "";
    const passErr = !form.password ? "Password is required" : "";

    setErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoading(true);
    setServerError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("business", JSON.stringify(res.data.business));
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6">
    <div className="w-full max-w-md">
      <div className="bg-[#111113] border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/40 transition">
        <div className="text-center mb-3">
          <h1 className="text-2xl font-semibold mb-2">
            SupportNest
          </h1>
          <p className="text-zinc-400 text-sm">
            Welcome Back!
          </p>
         </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-lg mb-5">
            {successMessage}
          </div>
        )}

        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-5">
            {serverError}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Email
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className="w-full bg-[#09090B] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />

            {errors.email && (
              <p className="text-red-400 text-xs mt-2">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className="w-full bg-[#09090B] border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-purple-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-xs mt-2">
                {errors.password}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition rounded-lg py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </div>

        <p className="text-center text-zinc-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-400 hover:text-purple-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  </div>
);
}
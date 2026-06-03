import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const validateOwnerName = (name) => {
  if (!name.trim()) return "Owner name is required";
  if (!/^[a-zA-Z\s]+$/.test(name)) return "Name must contain only letters";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return "";
};

const validateBusinessName = (name) => {
  if (!name.trim()) return "Business name is required";
  if (name.trim().length < 2) return "Business name too short";
  return "";
};

const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

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

const InputField = ({ name, type = "text", placeholder, value, onChange, onBlur, error, showToggle, showPassword, onTogglePassword }) => (
  <div>
    <div className="relative">
      <input
        name={name}
        type={showToggle ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition
          ${error ? "border-red-400 focus:ring-red-300 bg-red-50" : "border-gray-200 focus:ring-blue-500 bg-white"}
          ${showToggle ? "pr-12" : ""}`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeClosed /> : <EyeOpen />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ownerName: "", businessName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    if (name === "ownerName") error = validateOwnerName(value);
    if (name === "businessName") error = validateBusinessName(value);
    if (name === "email") error = validateEmail(value);
    if (name === "password") error = validatePassword(value);
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

  const validateAll = () => {
    const newErrors = {
      ownerName: validateOwnerName(form.ownerName),
      businessName: validateBusinessName(form.businessName),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async () => {
    setServerError("");
    if (!validateAll()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("business", JSON.stringify(res.data.business));
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
        <p className="text-gray-500 text-sm mb-6">Set up your AI support bot</p>

        {serverError && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <InputField name="ownerName" placeholder="Your Name" value={form.ownerName} onChange={handleChange} onBlur={handleBlur} error={errors.ownerName} />
          <InputField name="businessName" placeholder="Business Name" value={form.businessName} onChange={handleChange} onBlur={handleBlur} error={errors.businessName} />
          <InputField name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} />
          <InputField name="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} showToggle={true} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
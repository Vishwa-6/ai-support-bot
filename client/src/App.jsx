import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import ChatWidget from "./pages/ChatWidget";
import ChatLogs from "./pages/ChatLogs";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function AppContent() {
  useInactivityLogout(30 * 60 * 1000);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/knowledge" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
      <Route path="/logs" element={<PrivateRoute><ChatLogs /></PrivateRoute>} />
      <Route path="/chat/:businessId" element={<ChatWidget />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
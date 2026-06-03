import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard" />
              : <Navigate to="/register" />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/knowledge" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><ChatLogs /></PrivateRoute>} />
        <Route path="/chat/:businessId" element={<ChatWidget />} />
      </Routes>
    </BrowserRouter>
  );
}
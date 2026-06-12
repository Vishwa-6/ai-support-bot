import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useInactivityLogout = (
  inactivityTimeout = 30 * 60 * 1000
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inactivityTimer = useRef(null);

  const protectedRoutes = [
    "/dashboard",
    "/knowledge",
    "/logs",
  ];

  const isProtectedRoute = () => {
    return protectedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );
  };

  const resetTimer = () => {
    if (!isProtectedRoute()) return;

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      console.log("User inactive — logging out");

      localStorage.removeItem("token");
      localStorage.removeItem("business");

      navigate("/login");
    }, inactivityTimeout);
  };

  useEffect(() => {
    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    if (isProtectedRoute()) {
      resetTimer();
    }

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [location.pathname, inactivityTimeout, navigate]);

  return null;
};
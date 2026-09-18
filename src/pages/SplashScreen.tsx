import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, getHomeRouteByRole } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      if (isAuthenticated && userRole) {
        navigate(getHomeRouteByRole(userRole), { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Logo Harmony Symbol */}
      <div className="flex flex-col items-center animate-fade-in">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-150" />
          
          {/* Logo Symbol */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {/* Shield shape with H inside */}
            <path
              d="M60 10L100 25V55C100 80 80 100 60 110C40 100 20 80 20 55V25L60 10Z"
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              className="animate-pulse-soft"
            />
            {/* H letter */}
            <path
              d="M45 40V80M75 40V80M45 60H75"
              stroke="hsl(var(--foreground))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute bottom-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
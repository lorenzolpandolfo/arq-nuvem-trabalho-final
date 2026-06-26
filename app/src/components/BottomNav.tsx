import { Home, LogIn, Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { BRAND_GRADIENT, SHELL_MAX_WIDTH } from "../lib/constants";
import type { Screen } from "../types";

interface NavItem {
  id: Screen;
  icon: React.ElementType;
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeScreen: Screen = location.pathname.startsWith("/search")
    ? "search"
    : location.pathname.startsWith("/u")
      ? "profile"
      : "feed";

  const items: NavItem[] = [
    { id: "feed", icon: Home },
    { id: "search", icon: Search },
    { id: "profile", icon: localStorage.getItem("userId") ? User : LogIn },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border-t border-border z-30"
      style={{ width: `min(${SHELL_MAX_WIDTH}px, 100vw)` }}
    >
      <div className="flex items-center">
        {items.map(({ id, icon: Icon }) => {
          const isActive = activeScreen === id;

          return (
            <button
              key={id}
              onClick={() => {
                if (id === "feed") navigate("/feed");
                if (id === "search") navigate("/search");
                if (id === "profile") {
                  const userId = localStorage.getItem("userId");
                  if (userId) {
                    navigate(`/u/${userId}`);
                  } else {
                    navigate("/");
                  }
                }
              }}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={
                    isActive ? "text-pink-500" : "text-muted-foreground"
                  }
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 1.4}
                />
                {isActive && (
                  <div
                    className="absolute -inset-1 rounded-full opacity-20 blur-sm"
                    style={{ background: BRAND_GRADIENT }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

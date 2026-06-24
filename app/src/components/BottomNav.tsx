import { Home, Search, User } from "lucide-react";
import type { Screen } from "../types";
import { BRAND_GRADIENT, SHELL_MAX_WIDTH } from "../lib/constants";

interface NavItem {
  id: Screen;
  icon: React.ElementType;
  label: string;
  action?: () => void;
}

interface Props {
  screen: Screen;
  isViewingOwnProfile: boolean;
  onNavigate: (screen: Screen) => void;
  onProfilePress: () => void;
}

export function BottomNav({ screen, isViewingOwnProfile, onNavigate, onProfilePress }: Props) {
  const items: NavItem[] = [
    { id: "feed", icon: Home, label: "Feed" },
    { id: "search", icon: Search, label: "Buscar" },
    { id: "profile", icon: User, label: "Perfil", action: onProfilePress },
  ];

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border-t border-border z-30"
      style={{ width: `min(${SHELL_MAX_WIDTH}px, 100vw)` }}
    >
      <div className="flex items-center">
        {items.map(({ id, icon: Icon, label, action }) => {
          const isActive =
            screen === id && (id !== "profile" || isViewingOwnProfile);
          return (
            <button
              key={id}
              onClick={action ?? (() => onNavigate(id))}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={isActive ? "text-pink-500" : "text-muted-foreground"}
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 1.8}
                />
                {isActive && (
                  <div
                    className="absolute -inset-1 rounded-full opacity-20 blur-sm"
                    style={{ background: BRAND_GRADIENT }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? "text-pink-500" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

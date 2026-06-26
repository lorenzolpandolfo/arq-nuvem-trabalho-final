import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

import type { UserData } from "../types";
import { FONT_FAMILY, SHELL_MAX_WIDTH } from "../lib/constants";
import { clearToken } from "../lib/api";

import { AuthScreen } from "../screens/AuthScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { BottomNav } from "../components/BottomNav";
import { ComposeModal } from "../components/ComposeModal";

function AppContent() {
  const navigate = useNavigate();

  const [showCompose, setShowCompose] = useState(false);
  const [feedReloadKey, setFeedReloadKey] = useState(0);

  const handleLogin = (user: UserData) => {
    navigate("/feed");
  };

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  const handleOpenProfile = (userId: string) => {
    navigate(`/u/${userId}`);
  };

  const handleSaveProfile = (updated: UserData) => {};

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        fontFamily: FONT_FAMILY,
        maxWidth: SHELL_MAX_WIDTH,
        margin: "0 auto",
      }}
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<AuthScreen onLogin={handleLogin} />} />

          <Route
            path="/feed"
            element={
              <FeedScreen
                onOpenProfile={handleOpenProfile}
                onOpenCompose={() => setShowCompose(true)}
                onLogout={handleLogout}
                reloadKey={feedReloadKey}
              />
            }
          />

          <Route
            path="/search"
            element={<SearchScreen onOpenProfile={handleOpenProfile} />}
          />

          <Route
            path="/u/:userId"
            element={<ProfileScreen onSaveProfile={handleSaveProfile} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <BottomNav
          onNavigate={(screen) => {
            if (screen === "feed") navigate("/feed");
            if (screen === "search") navigate("/search");
            if (screen === "profile") {
              const id = localStorage.getItem("userId");
              if (id) navigate(`/u/${id}`);
            }
          }}
        />

        {showCompose && (
          <ComposeModal
            userId={localStorage.getItem("userId")}
            onPost={async (post) => {
              setShowCompose(false);
              setFeedReloadKey((prev) => prev + 1);
            }}
            onClose={() => setShowCompose(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

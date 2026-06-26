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

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const handleLogin = (user: UserData) => {
    setCurrentUser(user);
    navigate("/feed");
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    navigate("/");
  };

  const handleOpenProfile = (userId: string) => {
    navigate(`/u/${userId}`);
  };

  const handleSaveProfile = (updated: UserData) => {
    setCurrentUser((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const handleNewPost = async () => {};

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

        {showCompose && currentUser && (
          <ComposeModal
            user={currentUser}
            onPost={handleNewPost}
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

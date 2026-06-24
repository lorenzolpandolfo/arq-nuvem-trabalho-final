import { useState, useMemo } from "react";
import type { Screen, UserData } from "../types";
import { FONT_FAMILY, SHELL_MAX_WIDTH } from "../lib/constants";
import { getPosts, createPost, updateUser, getUserById } from "../lib/api";

import { AuthScreen } from "../screens/AuthScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { BottomNav } from "../components/BottomNav";
import { ComposeModal } from "../components/ComposeModal";

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [postVersion, setPostVersion] = useState(0); // triggers feed re-render on new post

  const posts = useMemo(() => getPosts(), [postVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (user: UserData) => {
    setCurrentUser(user);
    setScreen("feed");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen("auth");
  };

  const handleOpenProfile = (user: UserData) => {
    const fresh = getUserById(user.id) ?? user;
    setViewingUser(fresh);
    setScreen("profile");
  };

  const handleNewPost = (text: string) => {
    if (!currentUser) return;
    createPost(currentUser.id, text);
    setPostVersion((v) => v + 1);
  };

  const handleSaveProfile = (name: string, bio: string, avatar: string) => {
    if (!currentUser) return;
    const updated = updateUser(currentUser.id, { name, bio, avatar });
    if (!updated) return;
    setCurrentUser(updated);
    if (viewingUser?.id === currentUser.id) setViewingUser(updated);
  };

  if (screen === "auth") {
    return (
      <div style={{ fontFamily: FONT_FAMILY }}>
        <AuthScreen onLogin={handleLogin} />
      </div>
    );
  }

  const isViewingOwnProfile =
    screen === "profile" && viewingUser?.id === currentUser?.id;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: FONT_FAMILY, maxWidth: SHELL_MAX_WIDTH, margin: "0 auto" }}
    >
      <div className="flex-1 overflow-y-auto pb-20">
        {screen === "feed" && (
          <FeedScreen
            posts={posts}
            onOpenProfile={handleOpenProfile}
            onOpenCompose={() => setShowCompose(true)}
            onLogout={handleLogout}
          />
        )}

        {screen === "search" && (
          <SearchScreen onOpenProfile={handleOpenProfile} />
        )}

        {screen === "profile" && viewingUser && currentUser && (
          <ProfileScreen
            user={viewingUser}
            currentUserId={currentUser.id}
            onBack={() => setScreen("feed")}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </div>

      <BottomNav
        screen={screen}
        isViewingOwnProfile={isViewingOwnProfile}
        onNavigate={setScreen}
        onProfilePress={() => currentUser && handleOpenProfile(currentUser)}
      />

      {showCompose && currentUser && (
        <ComposeModal
          user={currentUser}
          onPost={handleNewPost}
          onClose={() => setShowCompose(false)}
        />
      )}
    </div>
  );
}

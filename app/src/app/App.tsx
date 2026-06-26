import { useState, useEffect, useCallback } from "react";
import type { Screen, UserData, Post } from "../types";
import { FONT_FAMILY, SHELL_MAX_WIDTH } from "../lib/constants";
import {
  clearToken,
  fetchPosts,
  fetchAuthors,
  createPost,
} from "../lib/api";

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

  // Global data loaded once after login
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<UserData[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const loadFeedData = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const [fetchedPosts, fetchedAuthors] = await Promise.all([
        fetchPosts(),
        fetchAuthors(),
      ]);
      setPosts(fetchedPosts);
      setAuthors(fetchedAuthors);
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  // Load data whenever the user logs in
  useEffect(() => {
    if (currentUser) loadFeedData();
  }, [currentUser, loadFeedData]);

  const handleLogin = (user: UserData) => {
    setCurrentUser(user);
    setScreen("feed");
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    setPosts([]);
    setAuthors([]);
    setScreen("auth");
  };

  const handleOpenProfile = (user: UserData) => {
    // Prefer the freshest copy from the authors list
    const fresh = authors.find((a) => a.id === user.id) ?? user;
    setViewingUser(fresh);
    setScreen("profile");
  };

  const handleNewPost = async (text: string) => {
    if (!currentUser) return;
    try {
      const post = await createPost(text);
      setPosts((prev) => [post, ...prev]);
    } catch (err) {
      console.error("Erro ao publicar:", err);
    }
  };

  // Called by ProfileScreen after a successful local edit.
  // NOTE: a PATCH /api/auth/users/me endpoint would persist this server-side.
  const handleSaveProfile = (updated: UserData) => {
    setCurrentUser(updated);
    setViewingUser(updated);
    setAuthors((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
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
            authors={authors}
            loading={loadingFeed}
            onOpenProfile={handleOpenProfile}
            onOpenCompose={() => setShowCompose(true)}
            onLogout={handleLogout}
          />
        )}

        {screen === "search" && (
          <SearchScreen
            authors={authors}
            onOpenProfile={handleOpenProfile}
          />
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

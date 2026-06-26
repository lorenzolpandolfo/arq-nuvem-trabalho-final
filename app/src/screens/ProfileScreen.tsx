import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Pencil, RefreshCw } from "lucide-react";

import type { UserData, AuthorPost, AuthorDataResponse } from "../types";
import { BRAND_GRADIENT } from "../lib/constants";
import { timeAgo } from "../lib/utils";
import { fetchAuthorById, fetchPostsByAuthor, likeProfile } from "../lib/api";
import { AvatarRing } from "../components/AvatarRing";
import { EditProfileModal } from "../components/EditProfileModal";

interface Props {
  onSaveProfile: (updated: UserData) => void;
}

export function ProfileScreen({ onSaveProfile }: Props) {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const isOwn = userId === localStorage.getItem("userId");

  const [showEdit, setShowEdit] = useState(false);
  const [posts, setPosts] = useState<AuthorPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [user, setUser] = useState<AuthorDataResponse | null>(null);

  const loadAuthorData = useCallback(async () => {
    if (!userId) return;

    setLoadingPosts(true);

    try {
      const [postsResponse, authorResponse] = await Promise.all([
        fetchPostsByAuthor(userId),
        fetchAuthorById(userId),
      ]);

      setPosts(postsResponse.posts);
      setUser(authorResponse);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAuthorData();
  }, [loadAuthorData]);

  const handleSave = (name: string, bio: string, avatar: string) => {
    if (!user) return;

    loadAuthorData();

    setShowEdit(false);
  };

  async function handleLikeProfile() {
    if (!userId) return;

    try {
      await likeProfile(userId);
      await loadAuthorData();
    } catch (err) {
      console.error("Erro ao curtir perfil:", err);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="font-bold text-base flex-1 truncate">Meu perfil</span>
      </div>

      <div className="px-4 pt-6 pb-5">
        <div className="flex items-start gap-4 mb-5">
          <AvatarRing src={user?.image_url} alt={user?.name} size={80} />

          <div className="flex-1 pt-1">
            <h2 className="text-lg font-extrabold leading-tight">
              {user?.name}
            </h2>

            {user?.bio && (
              <p className="text-muted-foreground text-sm mt-1 leading-snug">
                {user.bio}
              </p>
            )}

            <div className="flex gap-5 mt-3">
              <div className="text-center">
                <p className="text-base font-extrabold leading-none">
                  {posts.length}
                </p>
                <p className="text-muted-foreground text-xs mt-1">posts</p>
              </div>

              <div className="w-px bg-border" />

              <div className="text-center">
                <p className="text-base font-extrabold leading-none">
                  {user?.likes}
                </p>
                <p className="text-muted-foreground text-xs mt-1">curtidas</p>
              </div>
            </div>
          </div>
        </div>

        {isOwn ? (
          <button
            onClick={() => setShowEdit(true)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-secondary/70 transition-colors active:scale-[0.97]"
          >
            <Pencil size={15} />
            Editar perfil
          </button>
        ) : user?.has_like ? (
          <button
            onClick={handleLikeProfile}
            className="border-1 border-white w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
          >
            <Heart size={16} fill="white" />
            Remover curtida
          </button>
        ) : (
          <button
            onClick={handleLikeProfile}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
            style={{
              background: BRAND_GRADIENT,
              color: "white",
            }}
          >
            <Heart size={16} fill="white" />
            Curtir perfil
          </button>
        )}
      </div>

      <div className="border-t border-border" />

      {loadingPosts ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
          <RefreshCw size={15} className="animate-spin" />
          Carregando posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          Nenhuma postagem ainda
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="px-4 py-4 border-b border-border">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-bold text-sm">{post.author}</span>

              <span className="text-muted-foreground text-xs">
                · {timeAgo(post.created_at)}
              </span>
            </div>

            <p className="text-foreground/90 text-sm leading-relaxed">
              {post.description}
            </p>
          </article>
        ))
      )}

      {showEdit && user && (
        <EditProfileModal
          user={user}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Pencil, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { UserData, AuthorPost, AuthorDataResponse } from "../types";
import { BRAND_GRADIENT } from "../lib/constants";
import { timeAgo } from "../lib/utils";
import { fetchAuthorById, fetchPostsByAuthor, likeProfile } from "../lib/api";
import { AvatarRing } from "../components/AvatarRing";
import { EditProfileModal } from "../components/EditProfileModal";

interface Props {
  onSaveProfile: (updated: UserData) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

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
    } finally {
      setLoadingPosts(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAuthorData();
  }, [loadAuthorData]);

  const handleSave = () => {
    if (!user) return;
    loadAuthorData();
    setShowEdit(false);
  };

  async function handleLikeProfile() {
    if (!userId) return;

    await likeProfile(userId);
    await loadAuthorData();
  }

  return (
    <>
      {/* HEADER FIXO */}
      <div className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="h-14 px-4 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
          >
            <ArrowLeft size={20} />
          </motion.button>

          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-base flex-1 truncate"
          >
            Perfil
          </motion.span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60" />
      </div>

      {/* compensação do header */}
      <div className="pt-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-6 pb-5"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 mb-5"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AvatarRing src={user?.image_url} alt={user?.name} size={80} />
            </motion.div>

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
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="text-center"
                >
                  <p className="text-base font-extrabold leading-none">
                    {posts.length}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">posts</p>
                </motion.div>

                <div className="w-px bg-border" />

                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="text-center"
                >
                  <p className="text-base font-extrabold leading-none">
                    {user?.likes}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">curtidas</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {isOwn ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowEdit(true)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-secondary text-foreground"
            >
              <Pencil size={15} />
              Editar perfil
            </motion.button>
          ) : user?.has_like ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLikeProfile}
              className="border w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <Heart size={16} fill="white" />
              Remover curtida
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLikeProfile}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: BRAND_GRADIENT, color: "white" }}
            >
              <Heart size={16} fill="white" />
              Curtir perfil
            </motion.button>
          )}
        </motion.div>

        <div className="border-t border-border" />

        {loadingPosts ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm"
          >
            <RefreshCw size={15} className="animate-spin" />
            Carregando posts...
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-muted-foreground text-sm"
          >
            Nenhuma postagem ainda
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                  className="px-4 py-4 border-b border-border"
                >
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-bold text-sm">{post.author}</span>
                    <span className="text-muted-foreground text-xs">
                      · {timeAgo(post.created_at)}
                    </span>
                  </div>

                  <p className="text-foreground/90 text-sm leading-relaxed">
                    {post.description}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showEdit && user && (
          <EditProfileModal
            user={user}
            onSave={handleSave}
            onClose={() => setShowEdit(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

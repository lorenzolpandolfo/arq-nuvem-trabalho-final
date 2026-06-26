import { useState, useEffect, useCallback, useRef } from "react";
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
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
};

export function ProfileScreen({ onSaveProfile }: Props) {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const isOwn = userId === localStorage.getItem("userId");

  const [showEdit, setShowEdit] = useState(false);
  const [posts, setPosts] = useState<AuthorPost[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<AuthorDataResponse | null>(null);
  const isMounted = useRef(false);

  const loadAuthorData = useCallback(
    async (silent = false) => {
      if (!userId) return;

      if (!silent) setInitialLoading(true);

      try {
        const [postsResponse, authorResponse] = await Promise.all([
          fetchPostsByAuthor(userId),
          fetchAuthorById(userId),
        ]);

        setPosts(postsResponse.posts);
        setUser(authorResponse);
      } finally {
        if (!silent) setInitialLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {}, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      loadAuthorData(false);
    }
  }, [loadAuthorData]);

  const handleSave = () => {
    if (!user) return;
    loadAuthorData(true);
    setShowEdit(false);
  };

  async function handleLikeProfile() {
    if (!userId) return;
    await likeProfile(userId);
    await loadAuthorData(true); // silent — sem loading
  }

  if (initialLoading) {
    return (
      <>
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
            <span className="font-bold text-base flex-1 truncate">Perfil</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60" />
        </div>

        <div className="pt-14 flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RefreshCw size={16} />
          </motion.div>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            Carregando perfil...
          </motion.span>
        </div>
      </>
    );
  }

  return (
    <>
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
          <span className="font-bold text-base flex-1 truncate">Perfil</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60" />
      </div>

      <div className="pt-14">
        <div className="px-4 pt-6 pb-5">
          <div className="flex items-start gap-4 mb-5">
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
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <p className="text-base font-extrabold leading-none">
                    {posts.length}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">posts</p>
                </motion.div>

                <div className="w-px bg-border" />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <p className="text-base font-extrabold leading-none">
                    {user?.likes}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">curtidas</p>
                </motion.div>
              </div>
            </div>
          </div>

          {isOwn && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEdit(true)}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-secondary text-foreground"
            >
              <Pencil size={15} />
              Editar perfil
            </motion.button>
          )}

          {!isOwn && user && !user.has_like && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLikeProfile}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: BRAND_GRADIENT, color: "white" }}
            >
              <Heart size={16} fill="white" />
              Curtir perfil
            </motion.button>
          )}

          {!isOwn && user && user.has_like && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLikeProfile}
              className="border w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-foreground"
            >
              <Heart size={16} />
              Remover curtida
            </motion.button>
          )}
        </div>

        <div className="border-t border-border" />

        {posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Nenhuma postagem ainda
          </div>
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

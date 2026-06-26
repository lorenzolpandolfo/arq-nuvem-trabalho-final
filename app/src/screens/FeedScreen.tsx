import { LogOut, Plus, RefreshCw } from "lucide-react";
import type { Post, UserData } from "../types";
import { BRAND_GRADIENT, SHELL_MAX_WIDTH } from "../lib/constants";
import { timeAgo } from "../lib/utils";
import { AvatarRing } from "../components/AvatarRing";
import { useCallback, useEffect, useState } from "react";
import { fetchPosts } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  posts: Post[];
  authors: UserData[];
  onOpenCompose: () => void;
  onLogout: () => void;
  onOpenProfile: (userId: string) => void;
  reloadKey: number;
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
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

export function FeedScreen({
  onOpenProfile,
  onOpenCompose,
  onLogout,
  reloadKey,
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const loadFeedData = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    loadFeedData();
  }, [reloadKey, loadFeedData]);

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="h-14 px-4 flex items-center justify-between relative">
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text"
            style={{ backgroundImage: BRAND_GRADIENT }}
          >
            Lumio
          </motion.span>

          {localStorage.getItem("userId") && (
            <motion.button
              onClick={onLogout}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              title="Sair"
            >
              <LogOut size={18} />
            </motion.button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60" />
      </div>

      <div className="pt-14">
        <div className="">
          {loadingFeed ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center py-16 gap-3 text-muted-foreground text-sm"
            >
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
                Carregando feed...
              </motion.span>
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="py-20 text-center text-muted-foreground text-sm"
            >
              Nenhuma publicação ainda
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
                    className="px-4 py-4 border-b border-border hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex gap-3">
                      <button
                        onClick={() => onOpenProfile(post.author_id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        <AvatarRing
                          src={post.author_image_url}
                          alt={post.author_name}
                          size={40}
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 mb-1.5">
                          <button
                            onClick={() => onOpenProfile(post.author_id)}
                            className="font-bold text-sm text-foreground hover:underline underline-offset-2 leading-none"
                          >
                            {post.author_name}
                          </button>

                          <span className="text-muted-foreground text-xs">
                            · {timeAgo(post.created_date)}
                          </span>
                        </div>

                        <p className="text-foreground/90 text-sm leading-relaxed">
                          {post.description}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {localStorage.getItem("userId") && (
          <motion.button
            onClick={onOpenCompose}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="fixed z-30 flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-black/40"
            style={{
              background: BRAND_GRADIENT,
              bottom: "calc(4.5rem + 16px)",
              right: `max(16px, calc(50vw - ${SHELL_MAX_WIDTH / 2}px + 16px))`,
            }}
            title="Nova publicação"
          >
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          </motion.button>
        )}
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Search, Heart, RefreshCw } from "lucide-react";
import type { UserData } from "../types";
import { AvatarRing } from "../components/AvatarRing";
import { fetchAuthors } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onOpenProfile: (userId: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

export function SearchScreen({ onOpenProfile }: Props) {
  const [query, setQuery] = useState("");
  const [authors, setAuthors] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthors() {
      setLoading(true);

      try {
        const data = await fetchAuthors();
        if (!cancelled) setAuthors(data);
      } catch (err) {
        console.error("Erro ao carregar autores:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAuthors();

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? authors.filter((u) => u.name.toLowerCase().includes(q))
      : authors;
  }, [authors, query]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 pt-4 pb-3"
      >
        <motion.h1
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-bold mb-3"
        >
          Buscar pessoas
        </motion.h1>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />

          <input
            type="text"
            placeholder="Buscar por nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-secondary rounded-full pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none border border-transparent focus:border-pink-500/50 transition-all"
          />
        </div>
      </motion.div>

      <div>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm"
          >
            <RefreshCw size={14} className="animate-spin" />
            Carregando...
          </motion.div>
        ) : results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-muted-foreground text-sm"
          >
            Nenhum perfil encontrado
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <AnimatePresence mode="popLayout">
              {results.map((user) => (
                <motion.button
                  key={user.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenProfile(user.id)}
                  className="w-full px-4 py-3.5 flex items-center gap-3 border-b border-border text-left"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <AvatarRing
                      src={user.image_url}
                      alt={user.name}
                      size={48}
                    />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">
                      {user.name}
                    </p>

                    {user.bio && (
                      <p className="text-muted-foreground text-xs mt-0.5 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  <motion.div
                    className="flex items-center gap-1 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Heart
                      size={13}
                      className="text-muted-foreground"
                      fill="none"
                    />
                    <span className="text-xs text-muted-foreground">
                      {user.likes ?? 0}
                    </span>
                  </motion.div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
}

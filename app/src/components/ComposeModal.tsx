import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { AuthorDataResponse, Post } from "../types";
import { BRAND_GRADIENT, POST_MAX_LENGTH } from "../lib/constants";
import { fetchAuthorById, createPost } from "../lib/api";
import { AvatarRing } from "./AvatarRing";

interface Props {
  userId: string;
  onPost: (post: Post) => void;
  onClose: () => void;
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sheet = {
  hidden: { y: 60, opacity: 0, scale: 0.98 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
  exit: {
    y: 60,
    opacity: 0,
    transition: { duration: 0.18 },
  },
};

export function ComposeModal({ userId, onPost, onClose }: Props) {
  const [text, setText] = useState("");
  const [user, setUser] = useState<AuthorDataResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAuthorById(userId)
      .then((response) => {
        if (!cancelled) setUser(response);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const remaining = POST_MAX_LENGTH - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0;
  const progress = Math.min(text.length / POST_MAX_LENGTH, 1);
  const circumference = 2 * Math.PI * 10;

  async function handleSubmit() {
    if (!canPost || loading) return;

    setLoading(true);

    try {
      const post = await createPost(text.trim());
      onPost(post);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ maxWidth: 430, margin: "0 auto" }}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          variants={backdrop}
          onClick={onClose}
        />

        <motion.div
          className="relative mt-auto bg-card rounded-t-3xl border-t border-border px-4 pt-4 pb-8 flex flex-col gap-4"
          variants={sheet}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-10 h-1 bg-border rounded-full mx-auto mb-1"
          />

          <div className="flex items-center justify-between">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            >
              <X size={20} />
            </motion.button>

            <span className="text-sm font-bold">Nova publicação</span>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!canPost || loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white disabled:opacity-40 transition-opacity"
              style={{ background: BRAND_GRADIENT }}
            >
              <Send size={13} />
              Publicar
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AvatarRing src={user.image_url} alt={user.name} size={40} />
            </motion.div>

            <div className="flex-1">
              <p className="text-sm font-bold mb-2">{user.name}</p>

              <motion.textarea
                ref={textareaRef}
                autoFocus
                placeholder="O que está acontecendo?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm leading-relaxed resize-none focus:outline-none"
              />
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-end gap-3 border-t border-border pt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              animate={{
                scale: remaining < 10 ? [1, 1.1, 1] : 1,
              }}
              transition={{
                repeat: remaining < 10 ? Infinity : 0,
                duration: 0.6,
              }}
              className={`text-xs font-medium ${
                remaining < 0
                  ? "text-red-400"
                  : remaining < 20
                    ? "text-yellow-400"
                    : "text-muted-foreground"
              }`}
            >
              {remaining}
            </motion.span>

            <svg width={24} height={24} className="-rotate-90">
              <circle
                cx={12}
                cy={12}
                r={10}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={2}
              />
              <motion.circle
                cx={12}
                cy={12}
                r={10}
                fill="none"
                stroke={
                  remaining < 0
                    ? "#ef4444"
                    : remaining < 20
                      ? "#facc15"
                      : "#c13584"
                }
                strokeWidth={2}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                animate={{ strokeDashoffset: circumference * (1 - progress) }}
                transition={{ duration: 0.15 }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

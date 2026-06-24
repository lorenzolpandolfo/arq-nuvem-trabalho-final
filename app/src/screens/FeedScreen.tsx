import { LogOut, Plus } from "lucide-react";
import type { Post, UserData } from "../types";
import { BRAND_GRADIENT, SHELL_MAX_WIDTH } from "../lib/constants";
import { timeAgo } from "../lib/utils";
import { getUserById } from "../lib/api";
import { AvatarRing } from "../components/AvatarRing";

interface Props {
  posts: Post[];
  onOpenProfile: (user: UserData) => void;
  onOpenCompose: () => void;
  onLogout: () => void;
}

export function FeedScreen({ posts, onOpenProfile, onOpenCompose, onLogout }: Props) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <span
          className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text"
          style={{ backgroundImage: BRAND_GRADIENT }}
        >
          Lumio
        </span>
        <button
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Posts */}
      <div>
        {posts.map((post) => {
          const author = getUserById(post.userId);
          if (!author) return null;
          return (
            <article
              key={post.id}
              className="px-4 py-4 border-b border-border hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex gap-3">
                <button
                  onClick={() => onOpenProfile(author)}
                  className="flex-shrink-0 mt-0.5"
                >
                  <AvatarRing src={author.avatar} alt={author.name} size={40} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <button
                      onClick={() => onOpenProfile(author)}
                      className="font-bold text-sm text-foreground hover:underline underline-offset-2 leading-none"
                    >
                      {author.name}
                    </button>
                    <span className="text-muted-foreground text-xs">
                      · {timeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground/90 text-sm leading-relaxed">{post.text}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={onOpenCompose}
        className="fixed z-30 flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-black/40 transition-transform hover:scale-105 active:scale-95"
        style={{
          background: BRAND_GRADIENT,
          bottom: "calc(4.5rem + 16px)",
          right: `max(16px, calc(50vw - ${SHELL_MAX_WIDTH / 2}px + 16px))`,
        }}
        title="Nova publicação"
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </button>
    </>
  );
}

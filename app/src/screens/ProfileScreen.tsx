import { useState } from "react";
import { ArrowLeft, Heart, Pencil } from "lucide-react";
import type { UserData, Post } from "../types";
import { BRAND_GRADIENT } from "../lib/constants";
import { timeAgo } from "../lib/utils";
import {
  getProfileLikeCount,
  isProfileLiked,
  toggleProfileLike,
  getPostsByUser,
} from "../lib/api";
import { AvatarRing } from "../components/AvatarRing";
import { EditProfileModal } from "../components/EditProfileModal";

interface Props {
  user: UserData;
  currentUserId: string;
  onBack: () => void;
  onSaveProfile: (name: string, bio: string, avatar: string) => void;
}

export function ProfileScreen({ user, currentUserId, onBack, onSaveProfile }: Props) {
  const isOwn = user.id === currentUserId;
  const [liked, setLiked] = useState(isProfileLiked(user.id));
  const [likeCount, setLikeCount] = useState(getProfileLikeCount(user.id));
  const [showEdit, setShowEdit] = useState(false);

  const posts: Post[] = getPostsByUser(user.id);

  const handleToggleLike = () => {
    const result = toggleProfileLike(user.id);
    setLiked(result.liked);
    setLikeCount(result.count);
  };

  const handleSave = (name: string, bio: string, avatar: string) => {
    onSaveProfile(name, bio, avatar);
    setShowEdit(false);
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-base flex-1 truncate">{user.name}</span>
        {isOwn && (
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
          >
            <Pencil size={12} />
            Editar
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="px-4 pt-6 pb-5">
        <div className="flex items-start gap-4 mb-5">
          <AvatarRing src={user.avatar} alt={user.name} size={80} />
          <div className="flex-1 pt-1">
            <h2 className="text-lg font-extrabold leading-tight">{user.name}</h2>
            {user.bio && (
              <p className="text-muted-foreground text-sm mt-1 leading-snug">{user.bio}</p>
            )}
            <div className="flex gap-5 mt-3">
              <div className="text-center">
                <p className="text-base font-extrabold leading-none">{posts.length}</p>
                <p className="text-muted-foreground text-xs mt-1">posts</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-base font-extrabold leading-none">{likeCount}</p>
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
        ) : (
          <button
            onClick={handleToggleLike}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
            style={
              liked
                ? { background: BRAND_GRADIENT, color: "white" }
                : { backgroundColor: "var(--secondary)", color: "var(--foreground)" }
            }
          >
            <Heart size={16} fill={liked ? "white" : "none"} />
            {liked ? "Curtido" : "Curtir perfil"}
          </button>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          Nenhuma postagem ainda
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="px-4 py-4 border-b border-border">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-bold text-sm">{user.name}</span>
              <span className="text-muted-foreground text-xs">· {timeAgo(post.createdAt)}</span>
            </div>
            <p className="text-foreground/90 text-sm leading-relaxed">{post.text}</p>
          </article>
        ))
      )}

      {showEdit && (
        <EditProfileModal
          user={user}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}

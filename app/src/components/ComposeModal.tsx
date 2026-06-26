import { useState, useRef } from "react";
import { X, Send } from "lucide-react";
import type { UserData } from "../types";
import { BRAND_GRADIENT, POST_MAX_LENGTH } from "../lib/constants";
import { AvatarRing } from "./AvatarRing";

interface Props {
  user: UserData;
  onPost: (text: string) => void;
  onClose: () => void;
}

export function ComposeModal({ user, onPost, onClose }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = POST_MAX_LENGTH - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0;
  const progress = Math.min(text.length / POST_MAX_LENGTH, 1);
  const circumference = 2 * Math.PI * 10;

  const handleSubmit = () => {
    if (!canPost) return;
    onPost(text.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mt-auto bg-card rounded-t-3xl border-t border-border px-4 pt-4 pb-8 flex flex-col gap-4">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          >
            <X size={20} />
          </button>
          <span className="text-sm font-bold">Nova publicação</span>
          <button
            onClick={handleSubmit}
            disabled={!canPost}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: BRAND_GRADIENT }}
          >
            <Send size={13} />
            Publicar
          </button>
        </div>

        <div className="flex gap-3">
          <AvatarRing src={user.image_url} alt={user.name} size={40} />
          <div className="flex-1">
            <p className="text-sm font-bold mb-2">{user.name}</p>
            <textarea
              ref={textareaRef}
              autoFocus
              placeholder="O que está acontecendo?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-3">
          <span
            className={`text-xs font-medium ${
              remaining < 0
                ? "text-red-400"
                : remaining < 20
                  ? "text-yellow-400"
                  : "text-muted-foreground"
            }`}
          >
            {remaining}
          </span>
          <svg width={24} height={24} className="-rotate-90">
            <circle
              cx={12}
              cy={12}
              r={10}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={2}
            />
            <circle
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
              style={{ transition: "stroke-dashoffset 0.15s ease" }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

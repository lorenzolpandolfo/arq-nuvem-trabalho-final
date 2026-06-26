import { useState, useRef } from "react";
import { X, Check, Camera } from "lucide-react";
import { BRAND_GRADIENT, BIO_MAX_LENGTH } from "../lib/constants";
import { readFileAsDataURL } from "../lib/utils";
import type { AuthorDataResponse } from "../types";
import { updateProfile } from "../lib/api";

interface Props {
  user: AuthorDataResponse;
  onSave: (updated: AuthorDataResponse) => void;
  onClose: () => void;
}

export function EditProfileModal({ user, onSave, onClose }: Props) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState(user.image_url);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSave = name.trim().length > 0 && !loading;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataURL(file);
      setAvatar(dataUrl);
    } catch {}
  };

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);

    try {
      const updated = await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        image_url: avatar,
      });

      onSave(updated);
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
    } finally {
      setLoading(false);
    }
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

      <div className="relative mt-auto bg-card rounded-t-3xl border-t border-border px-4 pt-4 pb-8 flex flex-col gap-5">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          >
            <X size={20} />
          </button>

          <span className="text-sm font-bold">Editar perfil</span>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white disabled:opacity-40 transition-opacity"
            style={{ background: BRAND_GRADIENT }}
          >
            <Check size={13} />
            Salvar
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div
              className="p-[2px] rounded-full"
              style={{ background: BRAND_GRADIENT }}
            >
              <div className="p-[2px] bg-card rounded-full">
                <img
                  src={avatar}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-full object-cover bg-secondary"
                />
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-card"
              style={{ background: BRAND_GRADIENT }}
            >
              <Camera size={13} className="text-white" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold"
            style={{ color: "#dc2743" }}
          >
            Alterar foto
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Nome
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={BIO_MAX_LENGTH}
              rows={3}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none"
            />

            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/{BIO_MAX_LENGTH}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

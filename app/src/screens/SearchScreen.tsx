import { useEffect, useMemo, useState } from "react";
import { Search, Heart, RefreshCw } from "lucide-react";
import type { UserData } from "../types";
import { AvatarRing } from "../components/AvatarRing";
import { fetchAuthors } from "../lib/api";

interface Props {
  onOpenProfile: (userId: string) => void;
}

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
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold mb-3">Buscar pessoas</h1>

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
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
            <RefreshCw size={14} className="animate-spin" />
            Carregando...
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Nenhum perfil encontrado
          </div>
        ) : (
          results.map((user) => (
            <button
              key={user.id}
              onClick={() => onOpenProfile(user.id)}
              className="w-full px-4 py-3.5 flex items-center gap-3 border-b border-border hover:bg-white/[0.03] transition-colors text-left"
            >
              <AvatarRing src={user.image_url} alt={user.name} size={48} />

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

              <div className="flex items-center gap-1 flex-shrink-0">
                <Heart
                  size={13}
                  className="text-muted-foreground"
                  fill="none"
                />
                <span className="text-xs text-muted-foreground">
                  {user.likes ?? 0}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}

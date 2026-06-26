import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { AuthMode, AuthForm, UserData } from "../types";
import { BRAND_GRADIENT } from "../lib/constants";
import { login, register } from "../lib/api";

interface Props {
  onLogin: (user: UserData) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField =
    (field: keyof AuthForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (loading) return;

    if (mode === "register") {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Preencha todos os campos.");
        return;
      }
    } else {
      if (!form.email.trim() || !form.password) {
        setError("Preencha e-mail e senha.");
        return;
      }
    }

    setLoading(true);
    try {
      mode === "login"
        ? await login(form.email.trim(), form.password)
        : await register(form.name.trim(), form.email.trim(), form.password);

      const user = localStorage.getItem("userId");
      // console.log("user definido: ", user);
      onLogin(user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("400") || msg.includes("422")) {
        setError(
          mode === "login"
            ? "E-mail ou senha incorretos."
            : "Dados inválidos. Verifique os campos.",
        );
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: BRAND_GRADIENT }}
            >
              <MessageCircle size={18} className="text-white" fill="white" />
            </div>
            <span
              className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text"
              style={{ backgroundImage: BRAND_GRADIENT }}
            >
              Lumio
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Conecte-se com o mundo ao seu redor
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-secondary rounded-full p-1 mb-8">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {mode === "register" && (
            <Field label="Nome completo">
              <input
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={setField("name")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={inputCls}
              />
            </Field>
          )}

          <Field label="E-mail">
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={setField("email")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputCls}
            />
          </Field>

          <Field label="Senha">
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={setField("password")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputCls}
            />
          </Field>

          {error && (
            <p className="text-red-400 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            style={{ background: BRAND_GRADIENT }}
          >
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30 transition-all";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

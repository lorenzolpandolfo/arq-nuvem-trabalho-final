import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { AuthMode, AuthForm, UserData } from "../types";
import { BRAND_GRADIENT } from "../lib/constants";
import { login, register } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";

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
      onLogin(user as unknown as UserData);
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: BRAND_GRADIENT }}
            >
              <MessageCircle size={18} className="text-white" fill="white" />
            </motion.div>

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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex bg-secondary rounded-full p-1 mb-8"
        >
          {(["login", "register"] as const).map((m) => (
            <motion.button
              key={m}
              onClick={() => switchMode(m)}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </motion.button>
          ))}
        </motion.div>

        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          <Field label="E-mail">
            <motion.input
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={setField("email")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputCls}
            />
          </Field>

          <Field label="Senha">
            <motion.input
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={setField("password")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputCls}
            />
          </Field>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
            style={{ background: BRAND_GRADIENT }}
          >
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </motion.button>
        </motion.div>
      </motion.div>
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

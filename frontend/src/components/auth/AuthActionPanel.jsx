import { Button } from "@heroui/react";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { AppLogo } from "../AppLogo";
import { AuthCardShell } from "./AuthCardShell";

const logoTileClassName = [
  "relative rounded-2xl bg-linear-to-b from-white to-[#f2f2f7] p-2",
  "shadow-lg shadow-black/8 ring-1 ring-black/8",
  "dark:from-[#2c2c2e] dark:to-[#1a1a1c] dark:shadow-black/50 dark:ring-white/12",
].join(" ");

const continueButtonClassName = [
  "group relative h-13 overflow-hidden rounded-2xl text-[15px] font-semibold",
  "shadow-xl shadow-accent/45 dark:shadow-accent/35",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
  "after:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
  "dark:after:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
].join(" ");

export function AuthActionPanel() {
  const login = useAuthStore((state) => state.login);
    const register = useAuthStore((state) => state.register);
    const [mode, setMode] = useState("login");
    const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <section className="relative flex flex-1 flex-col items-stretch justify-center overflow-visible px-5 py-10 sm:px-10 md:overflow-hidden md:px-14 md:py-10 lg:px-16">
      <AuthCardShell>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div
              aria-hidden
              className="absolute -inset-3.5 rounded-[20px] bg-linear-to-br from-accent/22 via-accent/8 to-transparent opacity-90 blur-xl dark:from-accent/28 dark:via-accent/10"
            />
            <div className={logoTileClassName}>
              <AppLogo size={52} className="rounded-xl" alt="" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-accent">
            <SparklesIcon className="size-3.5" strokeWidth={2} aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Secure entry
            </span>
          </div>
        </div>

        <form className="space-y-3" onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          try {
            if (mode === "login") { await login({ email, password }); toast.success("Welcome back"); }
            else { await register({ email, password, fullname }); toast.success("Account created"); await login({ email, password }); }
          }
          catch (error) { toast.error(error.response?.data?.message || "Unable to sign in"); }
          finally { setBusy(false); }
        }}>
            {mode === "register" ? <input className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" placeholder="Your name" value={fullname} onChange={(event) => setFullname(event.target.value)} required /> : null}
            <input className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button
            fullWidth
            size="lg"
            variant="primary"
            className={continueButtonClassName}
            type="submit"
            isDisabled={busy}
          >
            <span className="relative z-1 flex items-center justify-center gap-2">
              {mode === "login" ? "Sign in" : "Create account"}
              <ArrowRightIcon
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Button>
        </form>
        <button className="mt-4 text-center text-sm text-accent" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-black/6 pt-6 text-[11px] text-[#8E8E93] dark:border-white/8 dark:text-[#636366]">
          <ShieldCheckIcon
            className="size-3.5 shrink-0 text-[#34C759] dark:text-[#30D158]"
            strokeWidth={2}
            aria-hidden
          />
          <span>Protected session · TLS encryption</span>
        </div>
      </AuthCardShell>
    </section>
  );
}

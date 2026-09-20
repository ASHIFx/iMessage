import { Button } from "@heroui/react";
import { ArrowRightIcon, MailIcon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { AppLogo } from "../AppLogo";
import { AuthCardShell } from "./AuthCardShell";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors";

const btnCls = [
  "group relative h-13 overflow-hidden rounded-2xl text-[15px] font-semibold",
  "shadow-xl shadow-accent/45 dark:shadow-accent/35",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
  "after:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:after:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
].join(" ");

export function AuthActionPanel() {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);

  const [mode, setMode] = useState("login");          // "login" | "register"
  const [step, setStep] = useState("form");            // "form" | "otp"
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");            // autofill in dev
  const [resendCooldown, setResendCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const otpInputRef = useRef(null);

  const startResendTimer = () => {
    setResendCooldown(30);
    const id = setInterval(() => setResendCooldown((n) => { if (n <= 1) { clearInterval(id); return 0; } return n - 1; }), 1000);
  };

  const handleForm = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setBusy(true);
    try {
      if (mode === "login") {
        const result = await login({ email, password });
        if (result.requiresOtp) {
          // Account exists but unverified — show OTP screen
          if (result.devOtp) setDevOtp(result.devOtp);
          setStep("otp");
          startResendTimer();
          toast("Please verify your email to continue", { icon: "📧" });
          setTimeout(() => otpInputRef.current?.focus(), 100);
        } else {
          toast.success("Welcome back!");
        }
      } else {
        if (!fullname.trim()) { toast.error("Please enter your name"); return; }
        const result = await register({ email, password, fullname: fullname.trim() });
        if (result.devOtp) setDevOtp(result.devOtp);
        setStep("otp");
        startResendTimer();
        toast.success(result.message || "Code sent! Check your email.");
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(otp)) { toast.error("Enter the 6-digit code"); return; }
    setBusy(true);
    try {
      await verifyOtp({ email, otp });
      toast.success(mode === "login" ? "Welcome back! 👋" : "Account created! Welcome 🎉");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired code");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || busy) return;
    setBusy(true);
    try {
      const result = await resendOtp(email);
      if (result.devOtp) { setDevOtp(result.devOtp); setOtp(result.devOtp); }
      startResendTimer();
      toast.success("New code sent!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resend code");
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => { setStep("form"); setOtp(""); setDevOtp(""); };

  return (
    <section className="relative flex flex-1 flex-col items-stretch justify-center overflow-visible px-5 py-10 sm:px-10 md:overflow-hidden md:px-14 md:py-10 lg:px-16">
      <AuthCardShell>
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div aria-hidden className="absolute -inset-3.5 rounded-[20px] bg-linear-to-br from-accent/22 via-accent/8 to-transparent opacity-90 blur-xl dark:from-accent/28 dark:via-accent/10" />
            <div className="relative rounded-2xl bg-linear-to-b from-white to-[#f2f2f7] p-2 shadow-lg shadow-black/8 ring-1 ring-black/8 dark:from-[#2c2c2e] dark:to-[#1a1a1c] dark:shadow-black/50 dark:ring-white/12">
              <AppLogo size={52} className="rounded-xl" alt="" />
            </div>
          </div>
        </div>

        {/* ── OTP verification step ─────────────────────────────────────────── */}
        {step === "otp" ? (
          <form className="space-y-4" onSubmit={handleVerify}>
            <div className="rounded-xl border border-border bg-surface p-4 text-center">
              <MailIcon className="mx-auto mb-2 size-8 text-accent" />
              <p className="text-sm font-semibold">Check your email</p>
              <p className="mt-1 text-xs text-muted">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
              </p>
              {devOtp && (
                <p className="mt-2 rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                  Dev mode — code: <strong>{devOtp}</strong>
                </p>
              )}
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-2">
              {[0,1,2,3,4,5].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ""}
                  ref={i === 0 ? otpInputRef : null}
                  className="h-12 w-10 rounded-xl border border-border bg-background text-center text-lg font-bold outline-none focus:border-accent transition-colors"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const next = otp.split("");
                    next[i] = val.slice(-1);
                    const joined = next.join("").slice(0, 6);
                    setOtp(joined);
                    if (val && i < 5) {
                      const inputs = e.target.parentElement.querySelectorAll("input");
                      inputs[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      const inputs = e.target.parentElement.querySelectorAll("input");
                      inputs[i - 1]?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    setOtp(pasted);
                  }}
                />
              ))}
            </div>

            <Button fullWidth size="lg" variant="primary" className={btnCls} type="submit" isDisabled={busy || otp.length < 6}>
              <span className="relative z-1 flex items-center justify-center gap-2">
                {busy ? "Verifying…" : mode === "login" ? "Verify & sign in" : "Verify & create account"}
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Button>

            <div className="flex items-center justify-between">
              <button type="button" className="text-sm text-muted hover:text-foreground" onClick={goBack}>← Back</button>
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-accent disabled:opacity-40"
                disabled={resendCooldown > 0 || busy}
                onClick={handleResend}
              >
                <RefreshCwIcon className="size-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        ) : (
        /* ── Login / Register form ──────────────────────────────────────────── */
          <form className="space-y-3" onSubmit={handleForm}>
            <p className="text-center text-sm font-semibold text-foreground">
              {mode === "login" ? "Sign in to iMessage" : "Create your account"}
            </p>

            {mode === "register" && (
              <input className={inputCls} placeholder="Your name" value={fullname}
                onChange={(e) => setFullname(e.target.value)} autoComplete="name" required />
            )}
            <input className={inputCls} type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            <input className={inputCls} type="password" placeholder="Password (min 6 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required />

            <Button fullWidth size="lg" variant="primary" className={btnCls} type="submit" isDisabled={busy}>
              <span className="relative z-1 flex items-center justify-center gap-2">
                {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Continue"}
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Button>
          </form>
        )}

        {/* Toggle mode */}
        {step === "form" && (
          <button className="mt-4 text-center text-sm text-accent" type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setOtp(""); }}>
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-black/6 pt-6 text-[11px] text-[#8E8E93] dark:border-white/8 dark:text-[#636366]">
          <ShieldCheckIcon className="size-3.5 shrink-0 text-[#34C759] dark:text-[#30D158]" strokeWidth={2} aria-hidden />
          <span>Protected session · TLS encryption</span>
        </div>
      </AuthCardShell>
    </section>
  );
}

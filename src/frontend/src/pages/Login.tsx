import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/firebase";
import { useNavigate } from "@tanstack/react-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { IndianRupee, Loader2, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && !form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password,
        );
        await updateProfile(cred.user, { displayName: form.name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const msg =
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password"
          ? "Invalid email or password"
          : err?.code === "auth/email-already-in-use"
            ? "Email already in use. Please login."
            : err?.code === "auth/weak-password"
              ? "Password must be at least 6 characters"
              : err?.message || "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen payment-grid-bg flex flex-col">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">
            PayCollect
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="font-display text-3xl sm:text-4xl text-foreground mb-2"
              >
                {mode === "login" ? "Welcome back" : "Create account"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm"
              >
                {mode === "login"
                  ? "Sign in to manage your payments"
                  : "Join PayCollect to start collecting payments"}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-card rounded-2xl shadow-card p-6 sm:p-8 card-shine"
            >
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        data-ocid="login.name.input"
                        placeholder="Rahul Sharma"
                        value={form.name}
                        onChange={set("name")}
                        className="pl-9 h-11"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      data-ocid="login.input"
                      placeholder="rahul@example.com"
                      value={form.email}
                      onChange={set("email")}
                      className="pl-9 h-11"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      data-ocid="login.password.input"
                      placeholder={
                        mode === "signup" ? "Min. 6 characters" : "••••••••"
                      }
                      value={form.password}
                      onChange={set("password")}
                      className="pl-9 h-11"
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                    />
                  </div>
                </div>

                {error && (
                  <p
                    data-ocid="login.error_state"
                    className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  data-ocid="login.submit_button"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "login"
                        ? "Signing in..."
                        : "Creating account..."}
                    </>
                  ) : mode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    type="button"
                    data-ocid="login.toggle"
                    onClick={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setError("");
                      setForm({ name: "", email: "", password: "" });
                    }}
                    className="text-primary font-medium hover:underline transition-colors"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="hover:text-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCashfreeOrder } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  IndianRupee,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: string;
      }) => void;
    };
  }
}

function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Cashfree === "function") {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="cashfree"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });
}

export default function PaymentForm() {
  const navigate = useNavigate();
  const { mutateAsync: createOrder, isPending } = useCreateCashfreeOrder();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
      e.email = "Valid email required";
    if (!form.phone.match(/^[6-9]\d{9}$/))
      e.phone = "Valid 10-digit phone required";
    const amt = Number.parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt < 1)
      e.amount = "Amount must be at least \u20b91";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      const amountInPaise = BigInt(
        Math.round(Number.parseFloat(form.amount) * 100),
      );
      const order = await createOrder({
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        amount: amountInPaise,
      });
      await loadCashfreeSDK();
      const cashfree = window.Cashfree({ mode: "production" });
      cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Failed to initiate payment. Please try again.",
      );
      navigate({ to: "/payment-failed" });
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen payment-grid-bg flex flex-col">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              PayCollect
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured by Cashfree</span>
          </div>
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
                Make a Payment
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm"
              >
                Fast, secure, and instant confirmation
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-card rounded-2xl shadow-card p-6 sm:p-8 card-shine"
            >
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      data-ocid="payment.input"
                      placeholder="Rahul Sharma"
                      value={form.name}
                      onChange={set("name")}
                      className={`pl-9 h-11 ${errors.name ? "border-destructive" : ""}`}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <p
                      data-ocid="payment.error_state"
                      className="text-destructive text-xs"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      data-ocid="payment.email.input"
                      placeholder="rahul@example.com"
                      value={form.email}
                      onChange={set("email")}
                      className={`pl-9 h-11 ${errors.email ? "border-destructive" : ""}`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p
                      data-ocid="payment.email.error_state"
                      className="text-destructive text-xs"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pr-2 border-r border-border leading-none">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      data-ocid="payment.phone.input"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={set("phone")}
                      className={`pl-20 h-11 ${errors.phone ? "border-destructive" : ""}`}
                      autoComplete="tel"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && (
                    <p
                      data-ocid="payment.phone.error_state"
                      className="text-destructive text-xs"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      data-ocid="payment.amount.input"
                      placeholder="500"
                      value={form.amount}
                      onChange={set("amount")}
                      className={`pl-9 h-11 text-lg font-semibold ${errors.amount ? "border-destructive" : ""}`}
                      min="1"
                      step="0.01"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      INR
                    </span>
                  </div>
                  {errors.amount && (
                    <p
                      data-ocid="payment.amount.error_state"
                      className="text-destructive text-xs"
                    >
                      {errors.amount}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-ocid="payment.submit_button"
                  disabled={isPending}
                  className="w-full h-12 text-base font-semibold mt-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay Now
                      {form.amount && !errors.amount
                        ? ` \u20b9${Number.parseFloat(form.amount).toLocaleString("en-IN")}`
                        : ""}
                    </>
                  )}
                </Button>

                {isPending && (
                  <p
                    data-ocid="payment.loading_state"
                    className="text-center text-xs text-muted-foreground animate-pulse"
                  >
                    Processing your request securely...
                  </p>
                )}
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-success" />
                <span>PCI DSS Compliant</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <span>Powered by Cashfree</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <a
                href="/admin"
                data-ocid="admin.link"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Admin Dashboard &rarr;
              </a>
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

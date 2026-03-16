import type { Payment } from "@/backend";
import { Button } from "@/components/ui/button";
import { useGetPaymentStatus } from "@/hooks/useQueries";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Hash,
  IndianRupee,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";

function formatAmount(paise: bigint): string {
  return (Number(paise) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS: "bg-success/15 text-success border-success/30",
    PENDING: "bg-warning/15 text-warning border-warning/30",
    FAILED: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span
        className={`text-sm font-medium truncate max-w-[200px] ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { order_id?: string };
  const orderId = search.order_id ?? null;

  const { data: payment, isLoading, isError } = useGetPaymentStatus(orderId);

  return (
    <div className="min-h-screen payment-grid-bg flex flex-col">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">PayCollect</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card rounded-2xl shadow-card overflow-hidden"
          >
            <div className="bg-success/10 border-b border-success/20 px-6 py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="inline-flex"
              >
                <CheckCircle2 className="w-16 h-16 text-success" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-display text-2xl sm:text-3xl text-foreground mt-4 mb-1"
              >
                Payment Successful!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-muted-foreground text-sm"
              >
                Your transaction has been confirmed
              </motion.p>
            </div>

            <div className="p-6">
              {isLoading && (
                <div
                  data-ocid="payment-success.loading_state"
                  className="flex flex-col items-center py-8 gap-3"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Fetching payment details...
                  </p>
                </div>
              )}
              {isError && (
                <div
                  data-ocid="payment-success.error_state"
                  className="text-center py-8"
                >
                  <p className="text-destructive text-sm">
                    Could not load payment details.
                  </p>
                </div>
              )}
              {payment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-3"
                  data-ocid="payment-success.panel"
                >
                  <div className="text-center py-4 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">
                      Amount Paid
                    </p>
                    <p className="font-display text-4xl text-success font-semibold">
                      &#8377;{formatAmount((payment as Payment).amount)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <DetailRow
                      icon={<Hash className="w-4 h-4" />}
                      label="Order ID"
                      value={(payment as Payment).orderId}
                      mono
                    />
                    <DetailRow
                      icon={<User className="w-4 h-4" />}
                      label="Customer"
                      value={(payment as Payment).customerName}
                    />
                    <DetailRow
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      value={(payment as Payment).email}
                    />
                    <DetailRow
                      icon={<Phone className="w-4 h-4" />}
                      label="Phone"
                      value={`+91 ${(payment as Payment).phone}`}
                    />
                    <DetailRow
                      icon={<Clock className="w-4 h-4" />}
                      label="Date & Time"
                      value={formatTimestamp((payment as Payment).timestamp)}
                    />
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <StatusBadge status={(payment as Payment).status} />
                    </div>
                  </div>
                </motion.div>
              )}
              {!payment && !isLoading && !isError && orderId && (
                <div className="py-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Order ID:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {orderId}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payment confirmation is being processed...
                  </p>
                </div>
              )}
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="payment-success.button"
                variant="outline"
                className="w-full mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
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

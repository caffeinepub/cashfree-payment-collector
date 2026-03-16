import type { Payment } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useCreateCashfreeOrder, useGetAllPayments } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  IndianRupee,
  Loader2,
  LogOut,
  Phone,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
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

function formatAmount(paise: bigint): string {
  return (Number(paise) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    SUCCESS: "bg-success/15 text-success border-success/30 hover:bg-success/20",
    PENDING: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20",
    FAILED:
      "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
        variants[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const { data: allPayments, isLoading: paymentsLoading } = useGetAllPayments();
  const { mutateAsync: createOrder, isPending: orderPending } =
    useCreateCashfreeOrder();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [amountError, setAmountError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const userPayments = (allPayments ?? []).filter(
    (p: Payment) => p.email === user?.email,
  );
  const successPayments = userPayments.filter(
    (p: Payment) => p.status === "SUCCESS",
  );
  const totalBalance = successPayments.reduce(
    (sum: number, p: Payment) => sum + Number(p.amount) / 100,
    0,
  );

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const amt = Number.parseFloat(amount);
    if (!amount || Number.isNaN(amt) || amt < 1) {
      setAmountError("Amount must be at least ₹1");
      valid = false;
    } else {
      setAmountError("");
    }
    if (!phone.match(/^[6-9]\d{9}$/)) {
      setPhoneError("Enter a valid 10-digit phone number");
      valid = false;
    } else {
      setPhoneError("");
    }
    if (!valid) return;

    try {
      const amountPaise = BigInt(Math.round(amt * 100));
      const order = await createOrder({
        customerName: user?.displayName || user?.email || "User",
        email: user?.email || "",
        phone,
        amount: amountPaise,
      });
      setDialogOpen(false);
      await loadCashfreeSDK();
      const cashfree = window.Cashfree({ mode: "production" });
      cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate payment");
      navigate({ to: "/payment-failed" });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  if (authLoading) {
    return (
      <div
        data-ocid="dashboard.loading_state"
        className="min-h-screen flex items-center justify-center payment-grid-bg"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen payment-grid-bg flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              PayCollect
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">
                {user.displayName || "User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
            <Button
              variant="outline"
              size="sm"
              data-ocid="dashboard.logout.button"
              onClick={handleLogout}
              className="gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl text-foreground">
            Hello, {user.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your balance and transaction history
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Balance card */}
          <div className="sm:col-span-2 bg-card rounded-2xl shadow-card p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Total Balance Added</span>
            </div>
            {paymentsLoading ? (
              <Skeleton className="h-12 w-48" />
            ) : (
              <p className="font-display text-4xl sm:text-5xl text-foreground font-semibold">
                ₹
                {totalBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
            {/* Add Money Button */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="dashboard.add_money.primary_button"
                  className="w-full sm:w-auto h-12 text-base font-semibold gap-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Money
                </Button>
              </DialogTrigger>
              <DialogContent
                data-ocid="dashboard.add_money.dialog"
                className="sm:max-w-md"
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    Add Money to Account
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMoney} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-amount">Amount (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="add-amount"
                        type="number"
                        data-ocid="dashboard.amount.input"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setAmountError("");
                        }}
                        className={`pl-9 h-11 text-lg font-semibold ${
                          amountError ? "border-destructive" : ""
                        }`}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    {amountError && (
                      <p
                        data-ocid="dashboard.amount.error_state"
                        className="text-destructive text-xs"
                      >
                        {amountError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pr-2 border-r border-border leading-none">
                        +91
                      </div>
                      <Input
                        id="add-phone"
                        type="tel"
                        data-ocid="dashboard.phone.input"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError("");
                        }}
                        className={`pl-20 h-11 ${
                          phoneError ? "border-destructive" : ""
                        }`}
                        maxLength={10}
                      />
                    </div>
                    {phoneError && (
                      <p
                        data-ocid="dashboard.phone.error_state"
                        className="text-destructive text-xs"
                      >
                        {phoneError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      data-ocid="dashboard.add_money.cancel_button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      data-ocid="dashboard.add_money.submit_button"
                      disabled={orderPending}
                      className="flex-1 gap-2"
                    >
                      {orderPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <IndianRupee className="w-4 h-4" />
                          Pay Now
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions count */}
          <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Transactions</span>
            </div>
            {paymentsLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="font-display text-4xl text-foreground font-semibold">
                {userPayments.length}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {successPayments.length} successful
            </p>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card rounded-2xl shadow-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display text-lg text-foreground">
              Transaction History
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              All your payment records
            </p>
          </div>

          {paymentsLoading ? (
            <div
              data-ocid="dashboard.transactions.loading_state"
              className="p-6 space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : userPayments.length === 0 ? (
            <div
              data-ocid="dashboard.transactions.empty_state"
              className="flex flex-col items-center py-16 gap-3 text-muted-foreground"
            >
              <Wallet className="w-12 h-12 opacity-30" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Add money to see your history here</p>
            </div>
          ) : (
            <Table data-ocid="dashboard.transactions.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPayments.map((payment: Payment, idx: number) => (
                  <TableRow
                    key={payment.orderId}
                    data-ocid={`dashboard.transactions.row.${idx + 1}`}
                  >
                    <TableCell className="text-sm">
                      {formatDate(payment.timestamp)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.orderId.slice(0, 16)}...
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{formatAmount(payment.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
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

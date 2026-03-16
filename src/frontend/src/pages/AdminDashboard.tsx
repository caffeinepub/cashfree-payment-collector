import type { Payment } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetFilteredPayments, useIsCallerAdmin } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

function formatAmount(paise: bigint): string {
  return (Number(paise) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS")
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/20">
        {status}
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge className="bg-warning/15 text-warning border border-warning/30 hover:bg-warning/20">
        {status}
      </Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/20">
      {status}
    </Badge>
  );
}

function LoginGate() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  return (
    <div className="min-h-screen payment-grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-card p-8 max-w-sm w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-2xl text-foreground mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm">
            Login to access the payment dashboard
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          data-ocid="admin.primary_button"
          className="w-full h-11"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login with Internet Identity"
          )}
        </Button>
      </motion.div>
    </div>
  );
}

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen payment-grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-card p-8 max-w-sm w-full text-center space-y-6"
      >
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <div>
          <h2 className="font-display text-xl text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-sm">
            You don&apos;t have admin privileges.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/" })}
          data-ocid="admin.secondary_button"
          className="w-full"
        >
          Go to Home
        </Button>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "success" | "warning";
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent === "success" ? "bg-success/10" : "bg-warning/10"}`}
        >
          {icon}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <p className="font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const {
    data: payments = [],
    isLoading,
    refetch,
    isFetching,
  } = useGetFilteredPayments(filter);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  if (!isAuthenticated) return <LoginGate />;
  if (adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return <AccessDenied />;

  const filtered = payments.filter((p: Payment) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.orderId.toLowerCase().includes(s) ||
      p.customerName.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) ||
      p.phone.includes(s)
    );
  });

  const totalSuccess = payments
    .filter((p: Payment) => p.status === "SUCCESS")
    .reduce((acc: bigint, p: Payment) => acc + p.amount, BigInt(0));
  const successCount = payments.filter(
    (p: Payment) => p.status === "SUCCESS",
  ).length;
  const pendingCount = payments.filter(
    (p: Payment) => p.status === "PENDING",
  ).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-lg font-semibold text-foreground">
                PayCollect
              </span>
              <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-ocid="admin.secondary_button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-success" />}
            label="Total Collections"
            value={`\u20b9${formatAmount(totalSuccess)}`}
            accent="success"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-success" />}
            label="Successful Payments"
            value={String(successCount)}
            accent="success"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-warning" />}
            label="Pending Payments"
            value={String(pendingCount)}
            accent="warning"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
        >
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              {["ALL", "SUCCESS", "PENDING", "FAILED"].map((f) => (
                <TabsTrigger key={f} value={f} data-ocid="admin.filter.tab">
                  {f}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-ocid="admin.search_input"
                className="pl-9 h-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              data-ocid="admin.button"
              className="h-9"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border shadow-xs overflow-hidden"
        >
          {isLoading ? (
            <div
              data-ocid="admin.loading_state"
              className="flex items-center justify-center py-16 gap-3"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">
                Loading payments...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="admin.empty_state"
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <Users className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">
                {search ? "No matching payments found" : "No payments yet"}
              </p>
            </div>
          ) : (
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Order ID</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">
                    Phone
                  </TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">
                    Date &amp; Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((payment: Payment, idx: number) => (
                  <TableRow
                    key={payment.orderId}
                    data-ocid="admin.row"
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">
                      {payment.orderId}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {payment.customerName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {payment.email}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      +91 {payment.phone}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      &#8377;{formatAmount(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                      {formatTimestamp(payment.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>

        <p className="text-xs text-muted-foreground text-center">
          Showing {filtered.length} of {payments.length} payments
        </p>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
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

import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, IndianRupee, RefreshCw, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen payment-grid-bg flex flex-col">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card rounded-2xl shadow-card overflow-hidden"
          >
            <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-10 text-center">
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
                <XCircle className="w-16 h-16 text-destructive" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-display text-2xl sm:text-3xl text-foreground mt-4 mb-2"
              >
                Payment Failed
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-muted-foreground text-sm max-w-xs mx-auto"
              >
                Your payment could not be processed. No amount has been deducted
                from your account.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 space-y-3"
            >
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Possible Reasons
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Payment was cancelled by user</li>
                  <li>Insufficient funds in account</li>
                  <li>Network or connectivity issue</li>
                  <li>Bank declined the transaction</li>
                </ul>
              </div>

              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="payment-failed.primary_button"
                className="w-full h-11"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="payment-failed.secondary_button"
                variant="outline"
                className="w-full h-11"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
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

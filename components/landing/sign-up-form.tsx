"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    // Simulated — wire to API later
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  }

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="size-4 text-[var(--octo-teal)]" />
          <span className="text-sm font-medium">
            You&apos;re on the list!
          </span>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
        >
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            className="h-9 w-56 border-white/[0.08] bg-white/[0.04] text-sm backdrop-blur-sm placeholder:text-white/25 focus-visible:border-[var(--octo-cyan)]/40 focus-visible:ring-[var(--octo-cyan)]/20"
          />
          <Button
            type="submit"
            size="sm"
            disabled={status === "loading"}
            className="h-9 shrink-0"
          >
            {status === "loading" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Get Early Access"
            )}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

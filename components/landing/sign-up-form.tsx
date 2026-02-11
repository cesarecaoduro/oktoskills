"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema } from "@/lib/schemas/signup";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = signupSchema.safeParse({ email });
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? "Invalid email");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/emails/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: result.data.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setSuccessMessage(
        data.duplicate
          ? (data.message ?? "Hey, we\u2019ve got you covered already \u2014 sit tight!")
          : "You\u2019re on the list!",
      );
      setStatus("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
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
              {successMessage}
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setErrorMessage("");
                }
              }}
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

      <AnimatePresence>
        {status === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex items-center gap-1.5"
          >
            <AlertCircle className="size-3.5 shrink-0 text-red-400" />
            <span className="text-xs text-red-400">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

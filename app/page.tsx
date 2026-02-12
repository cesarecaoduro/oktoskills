"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { DollarSign, Puzzle, ShieldCheck, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { BubbleBackground } from "@/components/landing/bubble-background";
import { FeatureCard } from "@/components/landing/feature-card";
import { CountdownTimer } from "@/components/landing/countdown-timer";
import { SignUpForm } from "@/components/landing/sign-up-form";

const features = [
  {
    icon: Workflow,
    title: "Visual Node Editor",
    description: "Drag, drop, and wire AI agents in an intuitive canvas.",
  },
  {
    icon: Puzzle,
    title: "Connect & Compose",
    description: "Mix LLMs, tools, and data sources into pipelines.",
  },
  {
    icon: ShieldCheck,
    title: "Own Your Data",
    description: "Run locally or self-host. Your prompts, your control.",
  },
  {
    icon: DollarSign,
    title: "Control Your Costs",
    description: "Route to the right model. Set budgets, track usage.",
  },
];

/* Stagger container / item variants */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.9 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function Home() {
  return (
    <main className="dark relative isolate h-screen overflow-hidden bg-[var(--octo-deep)] text-white">
      {/* Full-screen animated background (orbs + noise + vignette) */}
      <BubbleBackground />

      {/* Content layer */}
      <div className="relative z-20 flex h-full flex-col items-center justify-between px-6 py-6 lg:py-8">
        {/* ─── Top bar: logo + countdown ─── */}
        <motion.nav
          className="flex w-full max-w-6xl items-center justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/images/logo-text.png"
            alt="OctoSkills"
            width={180}
            height={36}
            priority
            className="h-auto w-28 lg:w-36"
          />
          <div className="flex items-center gap-4">
            <CountdownTimer />
            <Badge
              variant="secondary"
              className="hidden text-[10px] px-2.5 py-0.5 sm:inline-flex"
            >
              Feb 25
            </Badge>
          </div>
        </motion.nav>

        {/* ─── Center stage: mascot hero ─── */}
        <div className="relative flex flex-col items-center gap-5">
          {/* Mascot glow */}
          <motion.div
            className="pointer-events-none absolute -inset-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--octo-glow), transparent 65%)",
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                filter:
                  "drop-shadow(0 0 60px var(--octo-glow)) drop-shadow(0 0 120px var(--octo-blue))",
              }}
            >
              <Image
                src="/images/logo-mascot.png"
                alt="OctoSkills mascot"
                width={600}
                height={600}
                priority
                className="h-auto w-52 sm:w-64 lg:w-80 xl:w-[22rem]"
              />
            </motion.div>
          </motion.div>

          {/* Tagline + badge below mascot */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Shimmer
              as="h1"
              className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl"
              duration={3}
              spread={3}
            >
              Visual AI Workflow Orchestration
            </Shimmer>
            <p className="max-w-md text-center text-sm text-white/40">
              Build, connect, and orchestrate AI agent workflows with a
              node-based editor you fully control.
            </p>
          </motion.div>

          {/* Inline signup */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <SignUpForm />
          </motion.div>
        </div>

        {/* ─── Bottom: feature cards row ─── */}
        <motion.div
          className="w-full max-w-5xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-4 text-center text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} OctoSkills &middot; Built with
            tentacles
          </p>
        </motion.div>
      </div>
    </main>
  );
}

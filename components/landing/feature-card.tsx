"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-sm [transform:translateZ(0)] transition-colors duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--octo-blue)]/20">
        <Icon className="size-4 text-[var(--octo-cyan)]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

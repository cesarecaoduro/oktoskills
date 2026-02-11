"use client";

import { motion } from "motion/react";

const orbs = [
  {
    className: "w-[600px] h-[600px] bg-[var(--octo-blue)]/20",
    animate: { x: ["-10%", "10%", "-10%"], y: ["-5%", "15%", "-5%"] },
    duration: 22,
    style: { top: "-10%", left: "10%" },
  },
  {
    className: "w-[500px] h-[500px] bg-[var(--octo-teal)]/15",
    animate: { x: ["5%", "-15%", "5%"], y: ["10%", "-10%", "10%"] },
    duration: 28,
    style: { bottom: "-5%", right: "5%" },
  },
  {
    className: "w-[450px] h-[450px] bg-[var(--octo-cyan)]/10",
    animate: { x: ["-5%", "8%", "-5%"], y: ["5%", "-8%", "5%"] },
    duration: 25,
    style: { top: "30%", right: "20%" },
  },
];

export function BubbleBackground() {
  return (
    <>
      {/* Layer 0: Animated gradient orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, var(--octo-blue)/0.12, transparent 70%)",
          }}
        />

        {/* Floating orbs */}
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-[120px] ${orb.className}`}
            style={orb.style}
            animate={orb.animate}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Layer 1: Noise grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-[10] opacity-[0.035]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* Layer 2: Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[15]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </>
  );
}

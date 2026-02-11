"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-02-25T00:00:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const units: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
];

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-baseline gap-2">
      {units.map(({ key, label }, i) => (
        <div key={key} className="flex items-baseline gap-2">
          {i > 0 && (
            <span className="text-base font-light text-white/20">:</span>
          )}
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tabular-nums text-[var(--octo-cyan)] sm:text-2xl">
              {String(timeLeft[key]).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/30">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

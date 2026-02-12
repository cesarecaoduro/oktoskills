"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const publicPaths = ["/", "/sign-in", "/sign-up"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [ottPending, setOttPending] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("ott");
  });

  // Clear OTT pending once session is established
  useEffect(() => {
    if (ottPending && session) {
      setOttPending(false);
    }
    // Timeout: if OTT exchange takes too long, stop waiting
    if (ottPending) {
      const timer = setTimeout(() => setOttPending(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [ottPending, session]);

  useEffect(() => {
    if (isPending || ottPending) return;
    if (!session && !publicPaths.includes(pathname)) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, isPending, ottPending, pathname, router]);

  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  if (isPending || ottPending || !session) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, Home, PenTool, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/editor", label: "Editor", icon: PenTool },
  { href: "#", label: "Analytics", icon: BarChart3 },
  { href: "#", label: "Skills", icon: Sparkles },
  { href: "#", label: "Docs", icon: BookOpen },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-[180px] flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-3 py-3">
        <Image
          src="/images/logo-mascot.png"
          alt="OctoSkills"
          width={48}
          height={48}
        />
        <Image
          src="/images/logo-text.png"
          alt="OctoSkills"
          width={100}
          height={30}
        />
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        <TooltipProvider>
          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
      <Separator />
      <div className="flex items-center gap-2 px-4 py-3">
        <Avatar size="sm">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-muted-foreground">User</span>
      </div>
    </div>
  );
}

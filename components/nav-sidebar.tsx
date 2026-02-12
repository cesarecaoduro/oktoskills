"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlowEditorStore } from "@/lib/flow/store";
import { NODE_COLORS, type NodeColorKey } from "@/lib/flow/node-colors";
import { nodeCategories } from "@/lib/flow/node-defaults";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
  ChevronRight,
  ChevronsUpDown,
  GripVertical,
  Home,
  Keyboard,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  PenTool,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/editor", label: "Editor", icon: PenTool },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const setShortcutsDialogOpen = useFlowEditorStore(
    (s) => (s as any).setShortcutsDialogOpen,
  );
  const isEditor = pathname.startsWith("/editor");

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/octoskills-node", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex w-[200px] flex-col border-r bg-card">
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
      <nav className="flex flex-col gap-0.5 p-2">
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

      {isEditor && (
        <>
          <Separator />
          <div className="flex-1 overflow-y-auto p-2">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nodes
            </div>
            <div className="flex flex-col gap-0.5">
              {nodeCategories.map((category) => (
                <Collapsible key={category.id} defaultOpen>
                  <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors group">
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]:rotate-90" />
                    {category.label}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-0.5 pl-2">
                      {category.items.map((item) => (
                        <div
                          key={item.type}
                          draggable
                          onDragStart={(e) => onDragStart(e, item.type)}
                          className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                          <span
                            className="inline-block size-2 rounded-full shrink-0"
                            style={{ backgroundColor: NODE_COLORS[item.type as NodeColorKey]?.accent }}
                          />
                          <item.icon className="size-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </>
      )}

      {!isEditor && <div className="flex-1" />}

      <Separator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-accent/50 transition-colors">
            <Avatar size="sm">
              {session?.user?.image && (
                <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
              )}
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-xs font-medium text-muted-foreground">
              {session?.user?.name ?? session?.user?.email ?? "Guest"}
            </span>
            <ChevronsUpDown className="size-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          {session?.user && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
              {session.user.email}
            </div>
          )}
          <DropdownMenuItem disabled>
            <Settings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setShortcutsDialogOpen?.(true)}
          >
            <Keyboard className="mr-2 size-4" />
            Keyboard Shortcuts
            <span className="ml-auto text-xs text-muted-foreground">?</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="mr-2 size-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          {session?.user ? (
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/sign-in">
                <LogIn className="mr-2 size-4" />
                Sign in
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

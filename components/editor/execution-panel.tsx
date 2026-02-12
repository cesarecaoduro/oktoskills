"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, X } from "lucide-react";

type ExecutionPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ExecutionPanel({ isOpen, onClose }: ExecutionPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="flex h-48 flex-col border-t bg-card animate-in slide-in-from-bottom-2 duration-200">
      <Tabs defaultValue="current" className="flex flex-1 flex-col gap-0">
        <div className="flex items-center justify-between border-b px-4 py-1.5">
          <TabsList variant="line">
            <TabsTrigger value="current" className="gap-1.5 text-xs">
              Current Run
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                0
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              History
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs">
              <Trash2 className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X className="size-3" />
            </Button>
          </div>
        </div>
        <TabsContent value="current" className="flex-1">
          <ScrollArea className="h-full">
            <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
              Run your flow to see execution logs here.
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="history" className="flex-1">
          <ScrollArea className="h-full">
            <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
              No execution history yet.
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFlowEditorStore } from "@/lib/flow/store";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

interface ModelSelectorDialogProps {
  value: string;
  onSelect: (modelId: string) => void;
}

export function ModelSelectorDialog({
  value,
  onSelect,
}: ModelSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const { models, modelsLoading, modelsError, fetchModels, getModelById } =
    useFlowEditorStore();

  useEffect(() => {
    if (open && models.length === 0 && !modelsLoading && !modelsError) {
      fetchModels();
    }
  }, [open, models.length, modelsLoading, modelsError, fetchModels]);

  const selectedModel = getModelById(value);

  // Group models by provider
  const modelsByProvider = models.reduce(
    (acc, model) => {
      const provider = model.provider || "Other";
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, typeof models>
  );

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          role="combobox"
          aria-expanded={open}
        >
          {selectedModel ? (
            <div className="flex items-center gap-2">
              <ModelSelectorLogo provider={selectedModel.provider} />
              <span className="truncate">{selectedModel.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select model...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          {modelsLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading models...
              </span>
            </div>
          )}
          {modelsError && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-destructive">
                Failed to load models: {modelsError}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchModels}
              >
                Retry
              </Button>
            </div>
          )}
          {!modelsLoading && !modelsError && models.length === 0 && (
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          )}
          {!modelsLoading &&
            !modelsError &&
            Object.entries(modelsByProvider).map(
              ([provider, providerModels]) => (
                <ModelSelectorGroup key={provider} heading={provider}>
                  {providerModels.map((model) => (
                    <ModelSelectorItem
                      key={model.id}
                      value={model.name}
                      onSelect={() => {
                        onSelect(model.id);
                        setOpen(false);
                      }}
                    >
                      <ModelSelectorLogo provider={model.provider} />
                      <ModelSelectorName>{model.name}</ModelSelectorName>
                    </ModelSelectorItem>
                  ))}
                </ModelSelectorGroup>
              )
            )}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}

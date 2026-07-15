"use client";

import { AiProviderCard } from "@workspace/core/components/settings/ai-provider-card";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";

export function SettingsPage() {
  return (
    <ScrollArea className="w-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-28 md:pb-4">
        <AiProviderCard />
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

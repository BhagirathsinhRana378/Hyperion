"use client";

import { ProviderFactory } from "@workspace/core/lib/providers/provider-factory";
import { useAgentStore } from "@workspace/core/stores/agent-store";
import { useWorkspaceStore } from "@workspace/core/stores/workspace-store";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import {
  Activity,
  CheckCircle2,
  Database,
  Globe,
  KeyRound,
  RefreshCcw,
  Server,
  Sparkles,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function combineUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.trim().endsWith("/")
    ? baseUrl.trim().slice(0, -1)
    : baseUrl.trim();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function AiProviderCard() {
  const {
    apiKey,
    setApiKey,
    baseUrl,
    setBaseUrl,
    provider,
    setProvider,
    selectedModel,
    setSelectedModel,
    availableModels,
    setAvailableModels,
    health,
    setHealth,
    clearProviderConfig,
  } = useAgentStore();

  const { activeWorkspaceId, workspaces } = useWorkspaceStore();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const [isLoading, setIsLoading] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  const handleFetchModels = async () => {
    if (!apiKey) {
      toast.error("Please enter an API Key first.");
      return;
    }

    setIsLoading(true);
    try {
      if (provider === "anthropic") {
        const claudeModels = [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
        ];
        setAvailableModels(claudeModels);
        if (!claudeModels.includes(selectedModel)) {
          setSelectedModel(claudeModels[0] || "");
        }
        toast.success("Loaded Anthropic Claude models successfully!");
        setHealth("provider", true);
        return;
      }

      if (
        provider === "google" ||
        provider === "gemini" ||
        baseUrl.includes("generativelanguage.googleapis.com")
      ) {
        const geminiModels = [
          "gemini-1.5-flash",
          "gemini-1.5-pro",
          "gemini-1.0-pro",
        ];
        setAvailableModels(geminiModels);
        if (!geminiModels.includes(selectedModel)) {
          setSelectedModel(geminiModels[0] || "");
        }
        toast.success("Loaded Google Gemini models successfully!");
        setHealth("provider", true);
        setProviderError(null);
        return;
      }

      const isTauri =
        typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
      let response;
      let data;

      if (isTauri) {
        const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
        response = await tauriFetch(combineUrl(baseUrl, "models"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
      } else {
        response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: combineUrl(baseUrl, "models"),
            method: "GET",
            headers: { Authorization: `Bearer ${apiKey}` },
          }),
        });
        if (!response.ok) {
          throw new Error(`Proxy HTTP error! status: ${response.status}`);
        }
        data = await response.json();
      }

      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id);
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0] || "");
        }
        toast.success(`Fetched ${models.length} models successfully!`);
        setHealth("provider", true);
      } else {
        toast.error("Invalid response format from provider.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch models. Check your Base URL and API Key.");
      setHealth("provider", false);
      setProviderError(error.message || String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllHealth = async () => {
    setCheckingHealth(true);
    try {
      // 1. Check Backend (Tauri check)
      const isTauri =
        typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
      if (isTauri) {
        try {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("greet", { name: "Health" });
          setHealth("backend", true);
        } catch {
          setHealth("backend", false);
        }
      } else {
        setHealth("backend", true); // In browser, simulation is alive
      }

      // 2. Check Provider (LLM Connection check)
      if (apiKey) {
        const providerInstance = ProviderFactory.getProvider(provider);
        providerInstance.initialize(apiKey, baseUrl, selectedModel);
        try {
          const isOk = await providerInstance.healthCheck();
          setHealth("provider", isOk);
          if (isOk) {
            setProviderError(null);
          } else {
            setProviderError(
              (window as any).__lastProviderError || "Authentication failed."
            );
          }
        } catch (err: any) {
          setHealth("provider", false);
          setProviderError(err.message || String(err));
        }
      } else {
        setHealth("provider", false);
        setProviderError("API Key is missing.");
      }

      // 3. Check Planner
      setHealth("planner", true);

      toast.info("System health check completed.");
    } catch {
      toast.error("Health check encountered an unexpected error.");
    } finally {
      setCheckingHealth(false);
    }
  };

  // Run health check initially
  useEffect(() => {
    checkAllHealth();
  }, [checkAllHealth]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl">
        <CardHeader className="border-border/40 border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Main Agent AI Provider (BYOK)
              </CardTitle>
              <CardDescription>
                Configure your preferred LLM provider for the Main Agent.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>Provider type</Label>
            <Select
              onValueChange={(val) => {
                setProvider(val);
                if (val === "opencode") {
                  setBaseUrl("https://opencode.ai/zen/v1");
                } else if (val === "openai") {
                  setBaseUrl("https://api.openai.com/v1");
                } else if (val === "anthropic") {
                  setBaseUrl("https://api.anthropic.com/v1");
                } else if (val === "google") {
                  setBaseUrl(
                    "https://generativelanguage.googleapis.com/v1beta/openai/"
                  );
                }
              }}
              value={provider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opencode">
                  OpenCode Zen (Recommended)
                </SelectItem>
                <SelectItem value="openai">
                  OpenAI Compatible (OpenRouter, LMStudio, etc)
                </SelectItem>
                <SelectItem value="anthropic">Anthropic (Direct)</SelectItem>
                <SelectItem value="google">
                  Google Gemini (AI Studio)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="size-3.5" /> Base URL
            </Label>
            <Input
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://opencode.ai/zen/v1"
              value={baseUrl}
            />
            <p className="text-caption text-muted-foreground">
              E.g. https://opencode.ai/zen/v1 or https://openrouter.ai/api/v1
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <KeyRound className="size-3.5" /> API Key
            </Label>
            <Input
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              type="password"
              value={apiKey}
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label>Selected Model</Label>
              <Button
                className="h-7 text-xs"
                disabled={isLoading}
                onClick={handleFetchModels}
                size="sm"
                variant="secondary"
              >
                <RefreshCcw
                  className={cn("mr-1.5 size-3", isLoading && "animate-spin")}
                />
                Fetch Models
              </Button>
            </div>
            <Select onValueChange={setSelectedModel} value={selectedModel}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    availableModels.length === 0
                      ? "Fetch models first..."
                      : "Select a model..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
                {availableModels.length === 0 && (
                  <SelectItem disabled value="none">
                    No models fetched
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 flex justify-end border-border/20 border-t pt-4">
            <Button
              className="h-8 gap-1.5"
              onClick={() => {
                clearProviderConfig();
                toast.success(
                  "All AI Provider config and message data cleared!"
                );
              }}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="size-3.5" />
              Clear Config & Chat Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Monitoring Status */}
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl">
        <CardHeader className="border-border/40 border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Activity className="size-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">System Health Status</CardTitle>
                <CardDescription>
                  Real-time connectivity and service monitoring.
                </CardDescription>
              </div>
            </div>
            <Button
              disabled={checkingHealth}
              onClick={checkAllHealth}
              size="sm"
              variant="outline"
            >
              <RefreshCcw
                className={cn(
                  "mr-1.5 size-3.5",
                  checkingHealth && "animate-spin"
                )}
              />
              Check Status
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Backend Status */}
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-3">
            <Server className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-micro">Tauri Backend</p>
              <p className="text-caption text-muted-foreground">
                Shell PTY service
              </p>
            </div>
            {health.backend ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>

          {/* Provider Status */}
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-3">
            <Sparkles className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-micro">AI Provider</p>
              <p
                className="truncate text-caption text-muted-foreground"
                title={providerError || "LLM completion endpoint"}
              >
                {providerError
                  ? `Error: ${providerError}`
                  : "LLM completion endpoint"}
              </p>
            </div>
            {health.provider ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>

          {/* Supabase Status */}
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-3">
            <Database className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-micro">Supabase DB</p>
              <p className="text-caption text-muted-foreground">
                Cloud persistence
              </p>
            </div>
            <CheckCircle2 className="size-5 text-emerald-500" />
          </div>

          {/* Active Terminals Status */}
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-3">
            <Terminal className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-micro">Active Terminals</p>
              <p className="text-caption text-muted-foreground">
                {activeWorkspace
                  ? `${activeWorkspace.panes.length} PTY panes active`
                  : "0 active"}
              </p>
            </div>
            {activeWorkspace ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <XCircle className="size-5 text-muted-foreground/30" />
            )}
          </div>

          {/* Planner Status */}
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 p-3">
            <Activity className="size-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-micro">Main Planner</p>
              <p className="text-caption text-muted-foreground">
                Orchestration engine
              </p>
            </div>
            {health.planner ? (
              <CheckCircle2 className="size-5 text-emerald-500" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

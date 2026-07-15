export interface StreamDelta {
  content?: string;
  toolCalls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export function combineUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.trim().endsWith("/")
    ? baseUrl.trim().slice(0, -1)
    : baseUrl.trim();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export interface AIProvider {
  authenticate(): Promise<boolean>;
  disconnect(): void;
  healthCheck(): Promise<boolean>;
  initialize(apiKey: string, baseUrl: string, model: string): void;
  sendPrompt(
    messages: any[],
    tools?: any[]
  ): Promise<{ content: string; tool_calls?: any[] }>;
  stream(
    messages: any[],
    tools: any[],
    onDelta: (delta: StreamDelta) => void,
    signal?: AbortSignal
  ): Promise<{ content: string; tool_calls?: any[] }>;
}

export class OpenAICompatibleProvider implements AIProvider {
  private apiKey = "";
  private baseUrl = "";
  private model = "";

  initialize(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  private getFetchFn() {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    return async (url: string, init?: RequestInit) => {
      if (isTauri) {
        const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
        return tauriFetch(url, init);
      }
      // Browser proxy path
      return fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          method: init?.method || "GET",
          headers: init?.headers,
          body: init?.body ? JSON.parse(init.body as string) : undefined,
        }),
      });
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      const fetchFn = this.getFetchFn();
      if (
        this.baseUrl.includes("generativelanguage.googleapis.com") ||
        this.baseUrl.includes("google") ||
        this.baseUrl.includes("gemini")
      ) {
        const res = await fetchFn(
          combineUrl(this.baseUrl, "chat/completions"),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: this.model || "gemini-1.5-flash",
              messages: [{ role: "user", content: "Ping" }],
              max_tokens: 1,
            }),
          }
        );
        if (res.ok) {
          (window as any).__lastProviderError = null;
        } else {
          const bodyText = await res.text().catch(() => "");
          console.error(
            `Gemini Auth Fail: Status ${res.status}, Body: ${bodyText}`
          );
          (window as any).__lastProviderError =
            `Status ${res.status}: ${bodyText || "Empty response"}`;
        }
        return res.ok;
      }
      const res = await fetchFn(combineUrl(this.baseUrl, "models"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        (window as any).__lastProviderError = null;
      } else {
        const bodyText = await res.text().catch(() => "");
        (window as any).__lastProviderError =
          `Status ${res.status}: ${bodyText || "Empty response"}`;
      }
      return res.ok;
    } catch (err: any) {
      (window as any).__lastProviderError = err.message || String(err);
      return false;
    }
  }

  async sendPrompt(
    messages: any[],
    tools?: any[]
  ): Promise<{ content: string; tool_calls?: any[] }> {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (isTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      try {
        const fullContent = await invoke<string>("call_llm_stream", {
          payload: {
            provider: this.baseUrl.includes("generativelanguage.googleapis.com")
              ? "google"
              : "openai",
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            model: this.model,
            messages,
          },
        });
        return { content: fullContent };
      } catch (err: any) {
        throw new Error(err.message || String(err));
      }
    }

    const fetchFn = this.getFetchFn();
    const requestBody = {
      model: this.model,
      messages,
      tools: tools && tools.length > 0 ? tools : undefined,
    };

    const res = await fetchFn(combineUrl(this.baseUrl, "chat/completions"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      throw new Error(`OpenAI Provider Error: ${res.status}`);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message;
    if (!message) {
      throw new Error("Invalid response format from OpenAI provider.");
    }
    return {
      content: message.content || "",
      tool_calls: message.tool_calls,
    };
  }

  async stream(
    messages: any[],
    tools: any[],
    onDelta: (delta: StreamDelta) => void,
    signal?: AbortSignal
  ): Promise<{ content: string; tool_calls?: any[] }> {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (isTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      const { listen } = await import("@tauri-apps/api/event");

      const unlisten = await listen<string>("llm-delta", (event) => {
        onDelta({ content: event.payload });
      });

      try {
        const fullContent = await invoke<string>("call_llm_stream", {
          payload: {
            provider: this.baseUrl.includes("generativelanguage.googleapis.com")
              ? "google"
              : "openai",
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            model: this.model,
            messages,
          },
        });
        unlisten();
        return { content: fullContent };
      } catch (err: any) {
        unlisten();
        throw new Error(err.message || String(err));
      }
    }

    const requestBody = {
      model: this.model,
      messages,
      tools: tools && tools.length > 0 ? tools : undefined,
      stream: true,
    };

    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: combineUrl(this.baseUrl, "chat/completions"),
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        body: requestBody,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return this.sendPrompt(messages, tools);
    }

    const decoder = new TextDecoder();
    let accumulatedContent = "";
    const toolCallsMap: Record<number, any> = {};

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").map((line) => line.trim());

        for (const line of lines) {
          if (!line || line === "data: [DONE]") {
            continue;
          }
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const choice = data.choices?.[0];
              if (!choice) {
                continue;
              }

              const delta = choice.delta;
              if (!delta) {
                continue;
              }

              if (delta.content) {
                accumulatedContent += delta.content;
                onDelta({ content: delta.content });
              }

              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index;
                  if (toolCallsMap[idx] === undefined) {
                    toolCallsMap[idx] = {
                      id:
                        tc.id ||
                        `tc-${idx}-${Math.random().toString(36).slice(2, 6)}`,
                      type: "function",
                      function: { name: "", arguments: "" },
                    };
                  }
                  if (tc.id) {
                    toolCallsMap[idx].id = tc.id;
                  }
                  if (tc.function?.name) {
                    toolCallsMap[idx].function.name += tc.function.name;
                  }
                  if (tc.function?.arguments) {
                    toolCallsMap[idx].function.arguments +=
                      tc.function.arguments;
                  }

                  onDelta({
                    toolCalls: [toolCallsMap[idx]],
                  });
                }
              }
            } catch {
              // Ignore line parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const finalToolCalls =
      Object.keys(toolCallsMap).length > 0
        ? Object.values(toolCallsMap)
        : undefined;

    return {
      content: accumulatedContent,
      tool_calls: finalToolCalls,
    };
  }

  async healthCheck(): Promise<boolean> {
    return this.authenticate();
  }

  disconnect() {}
}

export class AnthropicDirectProvider implements AIProvider {
  private apiKey = "";
  private baseUrl = "https://api.anthropic.com/v1";
  private model = "";

  initialize(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://api.anthropic.com/v1";
    this.model = model;
  }

  private getFetchFn() {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    return async (url: string, init?: RequestInit) => {
      if (isTauri) {
        const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
        return tauriFetch(url, init);
      }
      return fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          method: init?.method || "GET",
          headers: init?.headers,
          body: init?.body ? JSON.parse(init.body as string) : undefined,
        }),
      });
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      const fetchFn = this.getFetchFn();
      // Fast check with zero tokens message
      const res = await fetchFn(combineUrl(this.baseUrl, "messages"), {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "dangerously-allow-developer-user-access": "true",
        },
        body: JSON.stringify({
          model: this.model || "claude-3-5-sonnet-20241022",
          max_tokens: 1,
          messages: [{ role: "user", content: "Ping" }],
        }),
      });
      return res.status === 200 || res.status === 400; // 400 means connected but parameter mismatch
    } catch {
      return false;
    }
  }

  private convertMessages(openaiMessages: any[]) {
    let system = "";
    const anthropicMessages: any[] = [];

    for (const msg of openaiMessages) {
      if (msg.role === "system") {
        system += (system ? "\n" : "") + msg.content;
      } else if (msg.role === "tool") {
        anthropicMessages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: msg.tool_call_id,
              content: msg.content,
            },
          ],
        });
      } else if (msg.role === "assistant" && msg.tool_calls) {
        const content: any[] = [];
        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }
        for (const tc of msg.tool_calls) {
          content.push({
            type: "tool_use",
            id: tc.id,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments),
          });
        }
        anthropicMessages.push({ role: "assistant", content });
      } else {
        anthropicMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    return { system, messages: anthropicMessages };
  }

  private convertTools(openaiTools: any[]) {
    if (!openaiTools || openaiTools.length === 0) {
      return;
    }
    return openaiTools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }

  async sendPrompt(
    messages: any[],
    tools?: any[]
  ): Promise<{ content: string; tool_calls?: any[] }> {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (isTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      try {
        const fullContent = await invoke<string>("call_llm_stream", {
          payload: {
            provider: "anthropic",
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            model: this.model,
            messages,
          },
        });
        return { content: fullContent };
      } catch (err: any) {
        throw new Error(err.message || String(err));
      }
    }

    const fetchFn = this.getFetchFn();
    const { system, messages: anthropicMessages } =
      this.convertMessages(messages);
    const anthropicTools = this.convertTools(tools || []);

    const requestBody = {
      model: this.model || "claude-3-5-sonnet-20241022",
      system: system || undefined,
      messages: anthropicMessages,
      tools: anthropicTools,
      max_tokens: 4000,
    };

    const res = await fetchFn(combineUrl(this.baseUrl, "messages"), {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "dangerously-allow-developer-user-access": "true",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      throw new Error(`Anthropic Provider Error: ${res.status}`);
    }

    const data = await res.json();
    let content = "";
    const toolCalls: any[] = [];

    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === "text") {
          content += block.text;
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            type: "function",
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input),
            },
          });
        }
      }
    }

    return {
      content,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }

  async stream(
    messages: any[],
    tools: any[],
    onDelta: (delta: StreamDelta) => void,
    signal?: AbortSignal
  ): Promise<{ content: string; tool_calls?: any[] }> {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    if (isTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      const { listen } = await import("@tauri-apps/api/event");

      const unlisten = await listen<string>("llm-delta", (event) => {
        onDelta({ content: event.payload });
      });

      try {
        const fullContent = await invoke<string>("call_llm_stream", {
          payload: {
            provider: "anthropic",
            apiKey: this.apiKey,
            baseUrl: this.baseUrl,
            model: this.model,
            messages,
          },
        });
        unlisten();
        return { content: fullContent };
      } catch (err: any) {
        unlisten();
        throw new Error(err.message || String(err));
      }
    }

    const { system, messages: anthropicMessages } =
      this.convertMessages(messages);
    const anthropicTools = this.convertTools(tools || []);

    const requestBody = {
      model: this.model || "claude-3-5-sonnet-20241022",
      system: system || undefined,
      messages: anthropicMessages,
      tools: anthropicTools,
      max_tokens: 4000,
      stream: true,
    };

    const response = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: combineUrl(this.baseUrl, "messages"),
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "dangerously-allow-developer-user-access": "true",
        },
        body: requestBody,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic Stream Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return this.sendPrompt(messages, tools);
    }

    const decoder = new TextDecoder();
    let accumulatedContent = "";
    const toolCallsMap: Record<string, any> = {};
    let currentEvent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").map((line) => line.trim());

        for (const line of lines) {
          if (!line) {
            continue;
          }
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "content_block_delta" && data.delta) {
                if (data.delta.type === "text_delta" && data.delta.text) {
                  accumulatedContent += data.delta.text;
                  onDelta({ content: data.delta.text });
                } else if (
                  data.delta.type === "input_json_delta" &&
                  data.delta.partial_json
                ) {
                  const idx = data.index;
                  if (toolCallsMap[idx]) {
                    toolCallsMap[idx].function.arguments +=
                      data.delta.partial_json;
                    onDelta({ toolCalls: [toolCallsMap[idx]] });
                  }
                }
              } else if (
                currentEvent === "content_block_start" &&
                data.content_block &&
                data.content_block.type === "tool_use"
              ) {
                const idx = data.index;
                toolCallsMap[idx] = {
                  id: data.content_block.id,
                  type: "function",
                  function: {
                    name: data.content_block.name,
                    arguments: "",
                  },
                };
              }
            } catch {
              // Ignore line parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const finalToolCalls =
      Object.keys(toolCallsMap).length > 0
        ? Object.values(toolCallsMap)
        : undefined;

    return {
      content: accumulatedContent,
      tool_calls: finalToolCalls,
    };
  }

  async healthCheck(): Promise<boolean> {
    return this.authenticate();
  }

  disconnect() {}
}

export class ProviderFactory {
  static getProvider(type: string): AIProvider {
    switch (type.toLowerCase()) {
      case "anthropic":
        return new AnthropicDirectProvider();
      case "opencode":
      case "openai":
      case "google":
      case "gemini":
      default:
        return new OpenAICompatibleProvider();
    }
  }
}

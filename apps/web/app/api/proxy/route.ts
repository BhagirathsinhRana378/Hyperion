const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
  /^\[?fc[0-9a-f]{2}:/i,
  /^\[?fe80:/i,
];

function isBlockedTarget(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return true;
  }
  return BLOCKED_HOSTNAME_PATTERNS.some((pattern) =>
    pattern.test(url.hostname)
  );
}

export async function POST(req: Request) {
  let payload: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  };

  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, method = "GET", headers, body } = payload;

  if (!url || typeof url !== "string") {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return Response.json({ error: "Invalid url" }, { status: 400 });
  }

  if (isBlockedTarget(target)) {
    return Response.json({ error: "Target host is not allowed" }, {
      status: 400,
    });
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body:
        method === "GET" || method === "HEAD" || body === undefined
          ? undefined
          : JSON.stringify(body),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: unknown) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Upstream request failed",
      },
      { status: 502 }
    );
  }
}

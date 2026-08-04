"use client";

import { useEffect, useState } from "react";

/**
 * useWebglSupported — reports whether this browser/machine can actually
 * create a WebGL context. Returns `false` until confirmed on the client
 * (so SSR and the first paint show the static fallback, never a broken
 * WebGL mount), then flips to `true` only if a context is obtainable.
 *
 * This is why the live backgrounds appear on some machines but not
 * others even with identical code: WebGL can be unavailable when
 * hardware acceleration is disabled, the GPU/driver is on the browser's
 * blocklist, inside a VM / remote-desktop session, or when the page has
 * hit the browser's live-context limit. In all those cases callers fall
 * back to a static gradient instead of rendering nothing.
 */
export function useWebglSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      ok = !!gl;
      // Free the probe context immediately so it never counts against the
      // browser's simultaneous-context limit.
      if (gl && "getExtension" in gl) {
        (gl as WebGLRenderingContext)
          .getExtension("WEBGL_lose_context")
          ?.loseContext();
      }
    } catch {
      ok = false;
    }
    setSupported(ok);
  }, []);

  return supported;
}

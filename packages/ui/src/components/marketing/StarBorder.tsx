"use client";

import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";
import "./StarBorder.css";

interface StarBorderProps extends React.ComponentProps<"div"> {
  /** RGB triplet, no rgba() wrapper — e.g. "238, 238, 237". */
  color?: string;
  hoverOpacity?: number;
  idleOpacity?: number;
  /** One slide cycle, e.g. "7s". Keep slow (6-8s) — ambient, not busy. */
  speed?: string;
  /** Border-ring thickness in px — how much of each comet peeks out. */
  thickness?: number;
}

/**
 * StarBorder — adapted from ReactBits (reactbits.dev, MIT).
 *
 * Two large blurred comets slide along the top/bottom edges. The
 * glow layer is masked to the border ring itself (content-box
 * exclude), so it's physically confined to a thin `thickness`-px
 * sliver and can never bleed into the card face — even when the
 * card behind it is translucent glass, brightening on hover.
 *
 * Wrap any panel: `<StarBorder className="rounded-3xl"><Card /></StarBorder>`.
 * Pass the same rounded-* class the wrapped card uses so the clip
 * shape matches.
 *
 * Color defaults to platinum, not the indigo/violet common in
 * ReactBits demos — Hyperion's palette has no hue anywhere.
 */
export function StarBorder({
  className,
  children,
  color = "238, 238, 237",
  speed = "7s",
  thickness = 1.5,
  idleOpacity = 0.25,
  hoverOpacity = 0.9,
  style,
  ...props
}: StarBorderProps) {
  return (
    <div
      className={cn("star-border-container", className)}
      style={
        {
          "--star-color": color,
          "--star-speed": speed,
          "--star-thickness": `${thickness}px`,
          "--star-idle-opacity": idleOpacity,
          "--star-hover-opacity": hoverOpacity,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div aria-hidden={true} className="star-border-glow">
        <span className="star-border-comet star-border-comet--top" />
        <span className="star-border-comet star-border-comet--bottom" />
      </div>
      <div className="star-border-inner">{children}</div>
    </div>
  );
}

import type React from "react";

interface SimpleShuffleProps {
  animationMode?: string;
  className?: string;
  duration?: number;
  ease?: string;
  loop?: boolean;
  respectReducedMotion?: boolean;
  // Props kept for compatibility
  shuffleDirection?: "left" | "right" | "up" | "down";
  shuffleTimes?: number;
  stagger?: number;
  style?: React.CSSProperties;
  text: string;
  threshold?: number;
  triggerOnce?: boolean;
  triggerOnHover?: boolean;
  [key: string]: any;
}

/** Simple fallback Shuffle component – renders text without animation. */
export default function SimpleShuffle({
  text,
  className = "",
  style = {},
  ...rest
}: SimpleShuffleProps) {
  return (
    <span className={className} style={style} {...rest}>
      {text}
    </span>
  );
}

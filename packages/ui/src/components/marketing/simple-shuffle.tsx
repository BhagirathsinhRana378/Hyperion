import React from 'react';

interface SimpleShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  // Props kept for compatibility
  shuffleDirection?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  animationMode?: string;
  shuffleTimes?: number;
  ease?: string;
  stagger?: number;
  threshold?: number;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
  loop?: boolean;
  [key: string]: any;
}

/** Simple fallback Shuffle component – renders text without animation. */
export default function SimpleShuffle({
  text,
  className = '',
  style = {},
  ...rest
}: SimpleShuffleProps) {
  return (
    <span className={className} style={style} {...rest}>
      {text}
    </span>
  );
}

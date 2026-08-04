"use client";

import { useEffect, useState } from "react";

// Character set for scrambling/decryption effect
const SCRAMBLE_CHARS = "010101&%@$#*?░▒▓█◤◢";

function scrambleText(text: string, strength: number): string {
  // strength goes from 0 (clean) to 1 (fully scrambled)
  return text
    .split("")
    .map((char) => {
      if (char === " ") {
        return " ";
      }
      if (Math.random() < strength) {
        return SCRAMBLE_CHARS[
          Math.floor(Math.random() * SCRAMBLE_CHARS.length)
        ];
      }
      return char;
    })
    .join("");
}

export function FlowAnimation() {
  const [offset, setOffset] = useState(0);
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");

  const rawLeftText =
    "uhm like... i was thinking we should probably... ya know, do a release... like friday? although it's probably going to slip... There's been a lot of back and forth and honestly the whole thing's been kind of chaotic, like no one knows...";
  const rawRightText =
    "We are releasing Hyperion. All systems are green and ready for deployment. The new workspace is live and running perfectly.";

  useEffect(() => {
    let frameId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) {
        lastTime = time;
      }

      // Update scrolling offset (adjust speed here)
      setOffset((prev) => (prev - 0.04) % 100);

      // Update text scramble effect every ~150ms
      if (time - lastTime > 150) {
        // Left text is partially garbled/scrambled (representing voice/rough input)
        setLeftText(scrambleText(rawLeftText, 0.25));
        // Right text is clean (representing decrypted/polished output)
        setRightText(rawRightText);
        lastTime = time;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="pointer-events-none absolute top-[260px] right-0 left-0 z-0 h-[600px] select-none overflow-hidden opacity-35">
      <svg
        className="h-full w-full text-muted-foreground/40"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1400 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Decryption and transcription background animation</title>
        {/* Left Path: Starts circular, then transitions into a wave towards center */}
        <path
          className="stroke-muted-foreground/15"
          d="M 180,230 A 90,90 0 1,1 180,410 A 90,90 0 1,1 180,230 A 90,90 0 0,1 270,320 C 320,320 370,380 450,380"
          id="left-path"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />

        {/* Right Ribbon Path: Wavy background ribbon representing clean output */}
        <path
          className="stroke-neutral-950 dark:stroke-neutral-900"
          d="M 550,380 C 650,380 750,280 870,280 C 990,280 1080,340 1280,260"
          id="right-ribbon"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="38"
        />

        {/* Right Inner Path: For positioning the text on top of the ribbon */}
        <path
          d="M 550,380 C 650,380 750,280 870,280 C 990,280 1080,340 1280,260"
          id="right-text-path"
          stroke="transparent"
          strokeWidth="1"
        />

        {/* Text on Left Path (Garbled Input) */}
        <text className="fill-muted-foreground/60 font-mono text-[10px] tracking-wider">
          <textPath href="#left-path" startOffset={`${offset}%`}>
            {leftText}
          </textPath>
        </text>

        {/* Text on Right Path (Decrypted/Clean Output) */}
        <text className="fill-neutral-50 font-medium font-sans text-[11px] uppercase tracking-wide dark:fill-neutral-200">
          <textPath href="#right-text-path" startOffset={`${offset + 50}%`}>
            {rightText}
          </textPath>
        </text>

        {/* Central Waveform Pill/Capsule */}
        <g transform="translate(435, 350)">
          {/* Outer Capsule Glow */}
          <rect
            className="fill-card stroke-border/40"
            height="60"
            rx="30"
            strokeWidth="1.5"
            width="120"
            x="0"
            y="0"
          />
          {/* Interactive active state glow */}
          <rect
            className="animate-pulse fill-transparent stroke-primary/10"
            height="68"
            rx="34"
            strokeWidth="2"
            width="128"
            x="-4"
            y="-4"
          />

          {/* Soundwave/Waveform Bars */}
          <g transform="translate(20, 30)">
            <line
              className="animate-[bounce_1.2s_infinite_100ms] stroke-primary/80"
              strokeLinecap="round"
              strokeWidth="3"
              x1="10"
              x2="10"
              y1="-12"
              y2="12"
            />
            <line
              className="animate-[bounce_1.2s_infinite_300ms] stroke-primary"
              strokeLinecap="round"
              strokeWidth="3"
              x1="20"
              x2="20"
              y1="-18"
              y2="18"
            />
            <line
              className="animate-[bounce_1.2s_infinite_500ms] stroke-primary/60"
              strokeLinecap="round"
              strokeWidth="3"
              x1="30"
              x2="30"
              y1="-6"
              y2="6"
            />
            <line
              className="animate-[bounce_1.2s_infinite_0ms] stroke-primary"
              strokeLinecap="round"
              strokeWidth="3"
              x1="40"
              x2="40"
              y1="-22"
              y2="22"
            />
            <line
              className="animate-[bounce_1.2s_infinite_400ms] stroke-primary/70"
              strokeLinecap="round"
              strokeWidth="3"
              x1="50"
              x2="50"
              y1="-15"
              y2="15"
            />
            <line
              className="animate-[bounce_1.2s_infinite_200ms] stroke-primary/50"
              strokeLinecap="round"
              strokeWidth="3"
              x1="60"
              x2="60"
              y1="-8"
              y2="8"
            />
            <line
              className="animate-[bounce_1.2s_infinite_600ms] stroke-primary/90"
              strokeLinecap="round"
              strokeWidth="3"
              x1="70"
              x2="70"
              y1="-16"
              y2="16"
            />
            <line
              className="animate-[bounce_1.2s_infinite_100ms] stroke-primary/40"
              strokeLinecap="round"
              strokeWidth="3"
              x1="80"
              x2="80"
              y1="-10"
              y2="10"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

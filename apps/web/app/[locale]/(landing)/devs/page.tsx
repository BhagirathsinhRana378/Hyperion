"use client";

import { useState } from "react";
import type { Dev } from "../components/dev-cards";
import { DevGrid } from "../components/dev-cards";
import { DevsBackdrop } from "../components/devs-backdrop";
import { ImpactBase } from "../components/impact-platform";

const devs: Dev[] = [
  {
    initials: "AK",
    name: "Aarav Kapoor",
    role: "Founding Engineer — Core",
    bio: "Builds the agent orchestration engine and the dependency resolution graph that keeps parallel tasks from stepping on each other.",
    contribution:
      "Designed the task-graph scheduler that lets independent agents claim work without stepping on each other's diffs.",
    skills: ["TypeScript", "Distributed Systems", "Rust"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    initials: "SM",
    name: "Sara Mehta",
    role: "Founding Engineer — Terminal",
    bio: "Owns the 16-pane terminal multiplexer — xterm.js, node-pty, and the WebSocket layer that streams every shell in real time.",
    contribution:
      "Built the 16-pane grid engine and the WebSocket protocol that keeps every pane in sync under 50ms.",
    skills: ["xterm.js", "WebSockets", "Node.js"],
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
  {
    initials: "RV",
    name: "Rohan Varma",
    role: "Founding Engineer — Platform",
    bio: "Runs the container-native execution layer and the git worktree isolation that keeps every agent's changes clean and reviewable.",
    contribution:
      "Shipped the per-agent worktree isolation model that makes every agent's diff independently reviewable.",
    skills: ["Docker", "Git Internals", "Go"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    portfolio: "https://example.com",
  },
  {
    initials: "NI",
    name: "Naina Iyer",
    role: "Founding Engineer — Design Systems",
    bio: "Designs the canvas overlay and the theme engine — 40+ OKLCh themes, one consistent interaction language across all of them.",
    contribution:
      "Built the OKLCh theme engine and the canvas overlay's live execution traces.",
    skills: ["Design Systems", "WebGL", "React"],
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    portfolio: "https://example.com",
  },
];

export default function DevsPage() {
  const [anyCardHovered, setAnyCardHovered] = useState(false);

  return (
    <div className="relative">
      {/* Stage — the beam's entire run: the hidden dev zones it passes
          over and the long fall down to ImpactBase, all sharing one
          container so DevsBackdrop (absolute inset-0, the LaserFlow beam)
          sizes itself to the whole thing. Roughly one screen tall so the
          beam reads top-to-platform without a dead upper region. */}
      <section className="relative min-h-[82vh] overflow-hidden pb-40">
        {/* The LaserFlow shader IS the beam — a volumetric platinum shaft
            offset to the 3rd/4th card seam, falling onto ImpactBase. */}
        <DevsBackdrop boosted={anyCardHovered} />

        {/* { <motion.div
          animate="visible"
          className="relative z-10 mx-auto max-w-2xl px-6 pt-40 text-center md:pt-52"
          initial={initialState}
          variants={staggerContainer}
        >
          <motion.div variants={revealVariants}>
            <Eyebrow>The team</Eyebrow>
          </motion.div>
          <motion.h1
            className="mt-4 font-display text-4xl text-foreground tracking-tighter md:text-6xl"
            variants={revealVariants}
          >
            Hidden in the light
          </motion.h1>
          <motion.p
            className="mt-4 text-muted-foreground"
            variants={revealVariants}
          >
            Four founding engineers, standing beneath the beam. Hover to meet
            them.
          </motion.p>
        </motion.div> } */}

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-40 md:pt-48">
          <DevGrid devs={devs} onHoverChange={setAnyCardHovered} />
        </div>
      </section>

      {/* The beam lands here — its top edge is pulled up under the
          beam's impact point (see ImpactBase's -mt). */}
      <ImpactBase members={devs.map((d) => d.initials)} />
    </div>
  );
}

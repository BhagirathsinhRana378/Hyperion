"use client";

import { useState } from "react";
import type { Dev } from "../components/dev-cards";
import { DevGrid } from "../components/dev-cards";
import { DevsBackdrop } from "../components/devs-backdrop";
import { ImpactBase } from "../components/impact-platform";

const devs: Dev[] = [
  {
    initials: "KS",
    name: "Karm Sorathiya",
    role: "Founding Engineer — Frontend Architect",
    bio: "Crafts high-fidelity layouts, micro-animations, and cross-platform native wrapper layouts for web, macOS, and Windows.",
    contribution:
      "Engineered the hybrid React shell architecture, fluid Framer Motion states, and native Tauri window pipelines.",
    skills: ["React", "Tauri", "TailwindCSS"],
    github: "https://github.com/KarmSorathiya378",
    linkedin: "https://www.linkedin.com/in/karm-sorathiya-b66214377",
  },
  {
    initials: "MR",
    name: "Meghraj Ravani",
    role: "Founding Engineer — Frontend & 3D Systems",
    bio: "Shapes immersive user experiences, interactive WebGL landing environments, volumetric lighting, and layout aesthetics.",
    contribution:
      "Shipped the LaserFlow rendering pipeline, grid repulsion physics, and custom visual theme controllers.",
    skills: ["WebGL", "Three.js", "Creative Design"],
    github: "https://github.com/Meghraj-6093",
    linkedin: "https://www.linkedin.com/in/meghraj-ravani",
  },
  {
    initials: "BR",
    name: "Bhagirathsinh Rana",
    role: "Founding Engineer — Core Engine & DevOps",
    bio: "Maintains containerized virtualization layers, secure sandboxed task execution, and worktree isolation systems.",
    contribution:
      "Architected the secure multi-container orchestration system that executes background agent code safely.",
    skills: ["Docker", "Linux Core", "Go"],
    github: "https://github.com/BhagirathsinhRana378",
    linkedin: "https://www.linkedin.com/in/bhagirathsinh-rana",
  },
  {
    initials: "MR",
    name: "Malay Raval",
    role: "Founding Engineer — Backend Systems & Terminal",
    bio: "Scales real-time terminal streaming, low-latency WebSocket streaming, and stateful session sync databases.",
    contribution:
      "Shipped the zero-latency multi-terminal shell multiplexer using xterm.js and custom stream serialization.",
    skills: ["WebSockets", "NodeJS", "xterm.js"],
    github: "https://github.com/Malaybhai11",
    linkedin: "https://www.linkedin.com/in/malay-raval-2708b8307",
  },
  {
    initials: "PT",
    name: "Parv Thakar",
    role: "Founding Engineer — Design Systems Lead",
    bio: "Packages modular UI primitive packages, type-safe multi-locale translations, and automated code quality gates.",
    contribution:
      "Unified the cross-platform styling engine and structural localization routes using Next-intl.",
    skills: ["Design Systems", "i18n", "CSS Modules"],
    github: "https://github.com/ParvThakar",
    linkedin: "https://www.linkedin.com/in/parv-thakar",
  },
];

export default function DevsPage() {
  const [anyCardHovered, setAnyCardHovered] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

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
        <DevsBackdrop boosted={anyCardHovered} dimmed={isCardOpen} />

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

        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 pt-40 md:pt-48">
          <DevGrid
            devs={devs}
            onHoverChange={setAnyCardHovered}
            onOpenChange={setIsCardOpen}
          />
        </div>
      </section>

      {/* The beam lands here — its top edge is pulled up under the
          beam's impact point (see ImpactBase's -mt). */}
      <ImpactBase members={devs.map((d) => d.initials)} />
    </div>
  );
}

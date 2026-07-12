"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Dev } from "../components/dev-cards";
import { DevGrid } from "../components/dev-cards";
import { DevsBackdrop } from "../components/devs-backdrop";
import { revealVariants, staggerContainer } from "../components/motion-primitives";

const devs: Dev[] = [
  {
    initials: "AK",
    name: "Aarav Kapoor",
    role: "Founding Engineer — Core",
    bio: "Builds the agent orchestration engine and the dependency resolution graph that keeps parallel tasks from stepping on each other.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    initials: "SM",
    name: "Sara Mehta",
    role: "Founding Engineer — Terminal",
    bio: "Owns the 16-pane terminal multiplexer — xterm.js, node-pty, and the WebSocket layer that streams every shell in real time.",
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
  {
    initials: "RV",
    name: "Rohan Varma",
    role: "Founding Engineer — Platform",
    bio: "Runs the container-native execution layer and the git worktree isolation that keeps every agent's changes clean and reviewable.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    initials: "NI",
    name: "Naina Iyer",
    role: "Founding Engineer — Design Systems",
    bio: "Designs the canvas overlay and the theme engine — 40+ OKLCh themes, one consistent interaction language across all of them.",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  },
];

export default function DevsPage() {
  const reduceMotion = useReducedMotion();
  const initialState = reduceMotion ? "visible" : "hidden";

  return (
    <div className="relative">
      <DevsBackdrop />

      {/* Hero */}
      <section className="relative mx-auto max-w-3xl px-6 pt-36 text-center">
        <motion.div
          animate="visible"
          initial={initialState}
          variants={staggerContainer}
        >
          
        </motion.div>
      </section>

      {/* Dev grid */}
      <section className="relative mx-auto max-w-5xl px-6 pt-16 pb-24 md:pb-32">
        <DevGrid devs={devs} />
      </section>
    </div>
  );
}

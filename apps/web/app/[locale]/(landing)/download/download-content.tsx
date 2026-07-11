"use client";

import { siteConfig } from "@workspace/core/config/site";
import { AnimatedGroup } from "@workspace/ui/components/landing/animated-group";
import { TextEffect } from "@workspace/ui/components/landing/text-effect";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { Check, Github, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { transitionVariants } from "@/lib/animations";
import { detectPlatform, type Platform } from "@/lib/detect-platform";
import type { ReleaseData } from "@/lib/github-releases";
import { DownloadBackdrop } from "../components/download-backdrop";
import {
  CommandBar,
  CtaLink,
  Eyebrow,
  FAQ,
  GlowCard,
} from "../components/marketing-kit";
import PlatformCards from "../components/platform-cards";
import { platformConfig } from "./platform-mappings";

const systemRequirements = [
  {
    platform: "Windows",
    items: [
      "Windows 10 1809+ (x64 / ARM64)",
      "8 GB RAM (16 GB recommended)",
      "WebView2 runtime",
      "1 GB free disk space",
    ],
  },
  {
    platform: "macOS",
    items: [
      "macOS 12 Monterey or newer",
      "Apple Silicon or Intel",
      "8 GB RAM (16 GB recommended)",
      "1 GB free disk space",
    ],
  },
  {
    platform: "Linux",
    items: [
      "Ubuntu 20.04+ / Fedora 38+ / Arch",
      "x64 or ARM64",
      "webkit2gtk 4.1",
      "1 GB free disk space",
    ],
  },
];

const comparisonRows: {
  feature: string;
  support: [boolean, boolean, boolean];
}[] = [
  { feature: "16-pane terminal grid", support: [true, true, true] },
  { feature: "AI agent swarm", support: [true, true, true] },
  { feature: "Git worktree isolation", support: [true, true, true] },
  { feature: "Auto-update channel", support: [true, true, true] },
  { feature: "Native notifications", support: [true, true, true] },
  { feature: "GPU-accelerated rendering", support: [true, true, false] },
  { feature: "Signed / notarized builds", support: [true, true, false] },
  { feature: "System package manager", support: [false, true, true] },
];

const downloadFaq = [
  {
    question: "Is Hyperion free to download?",
    answer:
      "Yes. Hyperion is open source — every desktop build and the CLI are free. Team features are configured per-workspace after install.",
  },
  {
    question: "How do updates work?",
    answer:
      "The desktop app updates itself through a signed release channel on Windows and macOS. On Linux, updates arrive through your package manager or by re-running the install script.",
  },
  {
    question: "Can I run Hyperion fully offline?",
    answer:
      "The workspace, terminals, and board work offline. Agents need network access only to reach the model provider you configure — point them at a local model and the whole system runs air-gapped.",
  },
  {
    question: "Which build should I pick on Apple Silicon?",
    answer:
      "The macOS Universal build runs natively on both Apple Silicon and Intel. If you want the smallest download, pick the arm64-specific build.",
  },
];

interface DownloadContentProps {
  release: ReleaseData | null;
}

export default function DownloadContent({ release }: DownloadContentProps) {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const { label, icon, primaryAssetKey } = platformConfig[platform];

  const primaryUrl =
    (release?.assets && primaryAssetKey && release.assets[primaryAssetKey]) ||
    "#";

  return (
    <main className="relative overflow-hidden">
      {/* Galaxy star field — replaces the old static radial glow */}
      <DownloadBackdrop />
      <section className="relative z-10 pt-24 md:pt-36">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <TextEffect
            as="h1"
            className="mx-auto mt-4 max-w-4xl text-balance font-display text-5xl tracking-tighter max-md:font-semibold md:text-7xl lg:mt-6 xl:text-[5.25rem]"
            preset="fade-in-blur"
            speedSegment={0.3}
          >
            {`Download ${siteConfig.name}`}
          </TextEffect>
          <TextEffect
            as="p"
            className="mx-auto mt-8 max-w-3xl text-balance text-lg text-muted-foreground"
            delay={0.5}
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
          >
            Get the latest version for your platform. One codebase for Web,
            Desktop, and Mobile.
          </TextEffect>

          {release?.version && (
            <AnimatedGroup variants={transitionVariants}>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                <span className="text-foreground/80 text-xs">
                  Latest release: v{release.version}
                </span>
              </div>
            </AnimatedGroup>
          )}

          <AnimatedGroup
            className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row"
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <CtaLink className="text-base" href={primaryUrl}>
              <span className="[&_svg]:size-5 motion-safe:[&_svg]:animate-bounce">
                {icon}
              </span>
              <span className="text-nowrap">{label}</span>
            </CtaLink>
            <CtaLink
              className="text-base"
              href={siteConfig.links.releases}
              rel="noopener noreferrer"
              target="_blank"
              variant="ghost"
            >
              <Github className="size-4" />
              <span className="text-nowrap">GitHub Releases</span>
            </CtaLink>
          </AnimatedGroup>
        </div>

        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div id="platforms">
            <PlatformCards
              assets={release?.assets || {}}
              detectedPlatform={platform}
            />
          </div>
        </AnimatedGroup>

        {/* Terminal install */}
        <div className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
          <Reveal direction="up" duration={250}>
            <div className="text-center">
              <Eyebrow className="justify-center">Prefer the terminal?</Eyebrow>
              <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
                Install in one line
              </h2>
            </div>
          </Reveal>
          <Reveal direction="up" duration={280} index={1}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <CommandBar command="npm install -g @hyperion/cli" />
              <CommandBar command="npx hyperion init" />
            </div>
          </Reveal>
        </div>

        {/* System requirements */}
        <div className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
          <Reveal direction="up" duration={250}>
            <div className="text-center">
              <Eyebrow className="justify-center">System requirements</Eyebrow>
              <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
                Runs where you work
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {systemRequirements.map((req, i) => (
              <Reveal
                direction="up"
                duration={280}
                index={i}
                key={req.platform}
              >
                <GlowCard className="h-full p-6" tilt={false}>
                  <h3 className="font-medium text-foreground">
                    {req.platform}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {req.items.map((item) => (
                      <li
                        className="flex items-start gap-2 text-muted-foreground text-sm"
                        key={item}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Platform comparison */}
        <div className="mx-auto max-w-4xl px-6 pb-16 md:pb-24">
          <Reveal direction="up" duration={250}>
            <div className="text-center">
              <Eyebrow className="justify-center">Feature parity</Eyebrow>
              <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
                Platform comparison
              </h2>
            </div>
          </Reveal>
          <Reveal direction="up" duration={300} index={1}>
            <div className="mt-10 overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-border/60 border-b bg-card/60">
                    <th className="px-4 py-3 font-medium text-foreground/70">
                      Feature
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-foreground/70">
                      Windows
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-foreground/70">
                      macOS
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-foreground/70">
                      Linux
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      className="border-border/40 border-b transition-colors duration-150 last:border-b-0 hover:bg-muted/30"
                      key={row.feature}
                    >
                      <td className="px-4 py-3 text-foreground/85">
                        {row.feature}
                      </td>
                      {row.support.map((supported, colIndex) => (
                        <td
                          className="px-4 py-3 text-center"
                          // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-column platform order
                          key={colIndex}
                        >
                          {supported ? (
                            <Check className="mx-auto size-4 text-primary" />
                          ) : (
                            <Minus className="mx-auto size-4 text-muted-foreground/50" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        {/* FAQ */}
        <div className="mx-auto max-w-3xl px-6 pb-24 md:pb-32">
          <Reveal direction="up" duration={250}>
            <div className="text-center">
              <Eyebrow className="justify-center">FAQ</Eyebrow>
              <h2 className="mt-3 text-balance font-display font-semibold text-3xl tracking-tight md:text-4xl">
                Download questions
              </h2>
            </div>
          </Reveal>
          <div className="mt-10">
            <FAQ items={downloadFaq} />
          </div>
        </div>
      </section>
    </main>
  );
}

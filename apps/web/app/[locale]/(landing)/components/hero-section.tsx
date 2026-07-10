"use client";

import { siteConfig } from "@workspace/core/config/site";
import { fetchLatestGithubVersion } from "@workspace/core/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { AnimatedGroup } from "@workspace/ui/components/landing/animated-group";
import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import { LogoCloud } from "@workspace/ui/components/landing/logo-cloud";
import { TextEffect } from "@workspace/ui/components/landing/text-effect";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { ArrowRight, Bot, LayoutGrid, Play, Rocket, SquareTerminal } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { transitionVariants } from "@/lib/animations";
import { Eyebrow, GlowCard } from "./marketing-kit";

const features = [
  {
    icon: LayoutGrid,
    title: "Workspace System",
    description: "Tile terminals, editors, and previews into one adaptive canvas.",
  },
  {
    icon: SquareTerminal,
    title: "Terminal Multiplexer",
    description: "Run and manage dozens of shells side by side without leaving the browser.",
  },
  {
    icon: Bot,
    title: "AI Agent Swarm",
    description: "Delegate tasks to autonomous agents that work your codebase in parallel.",
  },
];

export default function HeroSection() {
  const [latestTag, setLatestTag] = useState<string | null>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: shotRef,
    offset: ["start end", "start 0.35"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  useEffect(() => {
    fetchLatestGithubVersion().then((tag) => {
      if (tag) {
        setLatestTag(tag);
      }
    });
  }, []);

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative">
        {/* Soft single-tone glow — no background image, just a gradient for depth */}
        <div
          aria-hidden={true}
          className="-z-10 pointer-events-none absolute inset-x-0 top-0 h-[640px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent)_0%,transparent_70%)]"
        />

        <div className="relative pt-24 md:pt-36">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
              <AnimatedGroup variants={transitionVariants}>
                <Link
                  className="group mx-auto flex w-fit items-center gap-4 rounded-full border border-border bg-card p-1 pl-4 shadow-lg shadow-black/30 transition-colors duration-300 hover:border-primary/40 hover:bg-secondary"
                  href={siteConfig.links.releases}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="text-foreground/80 text-sm">
                    {latestTag
                      ? `${siteConfig.name} v${latestTag} Released`
                      : `${siteConfig.name} is live`}
                  </span>
                  <span className="block h-4 w-0.5 border-l border-border" />

                  <div className="size-6 overflow-hidden rounded-full bg-background duration-500 group-hover:bg-muted">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedGroup>

              <TextEffect
                as="h1"
                className="mx-auto mt-8 max-w-4xl text-balance font-display text-5xl tracking-tighter max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                preset="fade-in-blur"
                speedSegment={0.3}
              >
                {siteConfig.headline}
              </TextEffect>
              <TextEffect
                as="p"
                className="mx-auto mt-8 max-w-3xl text-balance text-lg text-muted-foreground"
                delay={0.5}
                per="line"
                preset="fade-in-blur"
                speedSegment={0.3}
              >
                {siteConfig.description}
              </TextEffect>

              <AnimatedGroup
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
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
                <Button
                  asChild={true}
                  className="cursor-pointer text-base"
                  size="lg"
                >
                  <Link href="/home">
                    <Play />
                    <span className="text-nowrap">View Web Demo</span>
                  </Link>
                </Button>
                <Button
                  asChild={true}
                  className="cursor-pointer text-base"
                  key={2}
                  size="lg"
                  variant="outline"
                >
                  <Link href="/docs/quick-start">
                    <Rocket />
                    <span className="text-nowrap">Start Building</span>
                  </Link>
                </Button>
              </AnimatedGroup>
            </div>
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
            <div
              className="mask-b-from-55% relative mt-8 -mr-56 overflow-hidden px-2 [perspective:1200px] sm:mt-12 sm:mr-0 md:mt-20"
              ref={shotRef}
            >
              <motion.div
                className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-card/40 p-4 shadow-2xl shadow-black/40 will-change-transform"
                style={{ rotateX, scale, transformPerspective: 1200 }}
              >
                <Image
                  alt="Hyperion workspace screenshot"
                  className="relative aspect-15/8 rounded-2xl border border-border/50"
                  height="1080"
                  priority={true}
                  src="/app-screen-dark.png"
                  width="1920"
                />
                <BorderBeam
                  className="from-transparent via-primary to-transparent"
                  duration={6}
                  size={200}
                />
              </motion.div>
            </div>
          </AnimatedGroup>
        </div>
      </section>

      {/* Feature strip — cursor-tilt glow cards, same language as Product/Services */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal direction="up" duration={250}>
          <div className="text-center">
            <Eyebrow className="justify-center">Inside the workspace</Eyebrow>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal direction="up" duration={280} index={i} key={feature.title}>
              <GlowCard className="h-full p-6">
                <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary transition-colors duration-300 group-hover/card:border-primary/40">
                  <feature.icon className="size-5 text-primary transition-transform duration-300 ease-out group-hover/card:scale-110 group-hover/card:-rotate-3" />
                </div>
                <h3 className="mt-4 font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      <LogoCloud />
    </main>
  );
}

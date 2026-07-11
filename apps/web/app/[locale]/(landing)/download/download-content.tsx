"use client";

import { siteConfig } from "@workspace/core/config/site";
import { AnimatedGroup } from "@workspace/ui/components/landing/animated-group";
import { TextEffect } from "@workspace/ui/components/landing/text-effect";
import { ArrowDown } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { transitionVariants } from "@/lib/animations";
import { detectPlatform, type Platform } from "@/lib/detect-platform";
import type { ReleaseData } from "@/lib/github-releases";
import { CtaLink, Eyebrow } from "../components/marketing-kit";
import PlatformCards from "../components/platform-cards";
import { platformConfig } from "./platform-mappings";

interface DownloadContentProps {
  release: ReleaseData | null;
}

export default function DownloadContent({ release }: DownloadContentProps) {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const scrollToPlatforms = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document
      .getElementById("platforms")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const { label, icon, primaryAssetKey } = platformConfig[platform];

  const primaryUrl =
    (release?.assets && primaryAssetKey && release.assets[primaryAssetKey]) ||
    "#";

  return (
    <main className="overflow-hidden">
      <div
        aria-hidden={true}
        className="landing-glow-breathe pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent)_0%,transparent_70%)]"
      />
      <section className="pt-24 md:pt-36">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <AnimatedGroup variants={transitionVariants}>
            <div className="flex justify-center">
              <Eyebrow>Download</Eyebrow>
            </div>
          </AnimatedGroup>

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
              className="cursor-pointer text-base"
              href="#platforms"
              onClick={scrollToPlatforms}
              variant="ghost"
            >
              <ArrowDown className="size-4" />
              <span className="text-nowrap">Other Platforms</span>
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
      </section>
    </main>
  );
}

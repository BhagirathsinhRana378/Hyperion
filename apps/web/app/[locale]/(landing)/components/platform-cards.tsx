import { siteConfig } from "@workspace/core/config/site";
import { Button } from "@workspace/ui/components/button";
import { Reveal } from "@workspace/ui/components/marketing/reveal";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Platform } from "@/lib/detect-platform";
import {
  type PlatformCardData,
  platformCards,
} from "../download/platform-mappings";
import { Badge, Eyebrow, GlowCard } from "./marketing-kit";

interface PlatformCardsProps {
  assets: Record<string, string>;
  detectedPlatform?: Platform;
}

function DownloadButton({
  href,
  label,
  ext,
}: {
  href: string | undefined;
  label: string;
  ext: string;
}) {
  if (!href) {
    return null;
  }
  const isExternal = href.startsWith("http");
  return (
    <Button
      asChild={true}
      className="w-full cursor-pointer justify-between bg-secondary text-secondary-foreground hover:bg-secondary/70 hover:text-primary"
      variant="secondary"
    >
      <Link
        href={href}
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
      >
        <span className="text-sm">{label}</span>
        <span className="font-mono text-muted-foreground text-xs">{ext}</span>
      </Link>
    </Button>
  );
}

function resolveHref(assetKey: string, assets: Record<string, string>) {
  return assetKey.startsWith("http") ? assetKey : assets[assetKey];
}

function PlatformCard({
  platform,
  assets,
  recommended,
}: {
  platform: PlatformCardData;
  assets: Record<string, string>;
  recommended: boolean;
}) {
  const resolvedDownloads = platform.downloads.filter((dl) =>
    resolveHref(dl.assetKey, assets)
  );

  return (
    <GlowCard
      beam={recommended}
      className={cn(
        "relative w-full p-6 text-center sm:w-[258px]",
        recommended &&
          "border-primary/40 shadow-[0_0_32px_-14px] shadow-primary/30"
      )}
    >
      {recommended && (
        <Badge
          className="absolute top-4 left-1/2 -translate-x-1/2"
          variant="solid"
        >
          Your platform
        </Badge>
      )}
      <CardDecorator>{platform.icon}</CardDecorator>
      <h3 className="mt-6 font-medium">{platform.name}</h3>
      <div className="mt-3 space-y-3">
        {resolvedDownloads.length > 0 ? (
          resolvedDownloads.map((dl) => (
            <DownloadButton
              ext={dl.ext}
              href={resolveHref(dl.assetKey, assets)}
              key={dl.assetKey + dl.label}
              label={dl.label}
            />
          ))
        ) : (
          <p className="py-2 text-muted-foreground text-sm">Coming soon</p>
        )}
      </div>
    </GlowCard>
  );
}

export default function PlatformCards({
  assets,
  detectedPlatform,
}: PlatformCardsProps) {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal direction="up" duration={300}>
          <div className="flex flex-col items-center text-center">
            <Eyebrow>Platforms</Eyebrow>
            <h2 className="mt-3 text-balance font-display font-semibold text-4xl tracking-tighter lg:text-5xl">
              Available Platforms
            </h2>
            <p className="mt-4 text-muted-foreground">
              Download {siteConfig.name} for your platform.
            </p>
          </div>
        </Reveal>
        <div className="mx-auto mt-8 flex flex-wrap items-stretch justify-center gap-5 md:mt-16">
          {platformCards.map((platform, i) => (
            <Reveal
              direction="up"
              duration={350}
              index={i}
              key={platform.name}
              offset={32}
            >
              <PlatformCard
                assets={assets}
                platform={platform}
                recommended={
                  !!detectedPlatform &&
                  detectedPlatform !== "unknown" &&
                  platform.matchKey === detectedPlatform
                }
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="[-webkit-mask-image:radial-gradient(circle,black_40%,transparent_60%)] [mask-image:radial-gradient(circle,black_40%,transparent_60%)] relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] group-hover/card:[--color-border:color-mix(in_oklab,var(--color-foreground)25%,transparent)]">
    <div
      aria-hidden={true}
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-50"
    />

    <div className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-lg border border-border bg-secondary transition-transform duration-300 group-hover/card:-rotate-3 group-hover/card:scale-110">
      {children}
    </div>
  </div>
);

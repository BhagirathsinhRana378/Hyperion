"use client";

import { Github, Linkedin, Twitter } from "lucide-react";
import { Unbounded } from "next/font/google";
import Link from "next/link";
import { BorderTrace } from "./border-trace";
import { FooterWordmark } from "./footer-wordmark";

const wordmarkFont = Unbounded({
  subsets: ["latin"],
  variable: "--font-wordmark",
  weight: ["700"],
});

/** Must match the panel's `rounded-t-[32px]` below — BorderTrace needs
 * the exact px value to trace a path that aligns with the real corners
 * (the bottom of its path lives inside the fade zone, so only the top
 * corners ever read). */
const PANEL_RADIUS = 32;

/** Lower ~30% of the footer dissolves into the page — no bottom edge,
 * no cutoff line; the oversized wordmark fades away with it. */
const FOOTER_FADE_MASK =
  "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0) 100%)";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "AI Agent Swarm", href: "/features" },
      { label: "Terminal Multiplexer", href: "/features" },
      { label: "Download", href: "/download" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quick start", href: "/docs#quick-start" },
      { label: "CLI reference", href: "/docs#cli" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "#" },
      { label: "Discord", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

export function HyperionFooter() {
  return (
    <footer className="px-6 sm:px-12 lg:px-16" data-slot="hyperion-footer">
      {/* Near-full-width panel on the page's own black: rounded top
          corners only, a whisper of a border, and the whole lower
          third dissolving into the background via the fade mask — no
          boxed-card feel, no visible bottom edge. */}
      <div
        className="relative mx-auto max-w-[1760px] overflow-hidden rounded-t-[32px] border border-white/5 border-b-0 bg-background text-foreground"
        data-slot="hyperion-footer-panel"
        style={{
          maskImage: FOOTER_FADE_MASK,
          WebkitMaskImage: FOOTER_FADE_MASK,
        }}
      >
        <BorderTrace radius={PANEL_RADIUS} />

        <div
          className={`${wordmarkFont.variable} px-8 pt-16 pb-8 md:px-14 md:pt-20 lg:px-20`}
        >
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-1">
              <Link
                className="font-display text-foreground text-lg tracking-tight"
                href="/"
              >
                Hyperion
              </Link>
              <p className="mt-3 max-w-xs text-muted-foreground text-sm">
                The agentic workspace for autonomous software development.
              </p>
              <div className="mt-6 flex gap-4">
                <Link
                  aria-label="GitHub"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  href="#"
                >
                  <Github className="size-5" />
                </Link>
                <Link
                  aria-label="Twitter"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  href="#"
                >
                  <Twitter className="size-5" />
                </Link>
                <Link
                  aria-label="LinkedIn"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary"
                  href="#"
                >
                  <Linkedin className="size-5" />
                </Link>
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-medium text-foreground/50 text-xs uppercase tracking-[0.2em]">
                  {section.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="text-muted-foreground text-sm transition-colors duration-200 hover:text-primary"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-border/50 border-t pt-6 sm:flex-row">
            <p className="text-muted-foreground text-xs">
              &copy; {new Date().getFullYear()} Hyperion. All rights reserved.
            </p>
          </div>

          {/* Hidden-signature wordmark — a watermark, not a lit-up logo */}
          <div className="mt-2">
            <FooterWordmark />
          </div>
        </div>
      </div>
    </footer>
  );
}

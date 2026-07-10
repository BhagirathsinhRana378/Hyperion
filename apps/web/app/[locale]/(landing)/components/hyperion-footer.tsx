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

/** Must match the panel's `rounded-[32px]` below — BorderTrace needs the
 * exact px value to trace a path that aligns with the real corners. */
const PANEL_RADIUS = 32;

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Workspace System", href: "/product" },
      { label: "Terminal Multiplexer", href: "/coding" },
      { label: "AI Agent Swarm", href: "/coding" },
      { label: "Task Board", href: "/product" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quick start", href: "/docs/quick-start" },
      { label: "News", href: "/news" },
      { label: "Download", href: "/download" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
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
    <footer className="px-4 pb-6 md:px-6 md:pb-10" data-slot="hyperion-footer">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-foreground/10 bg-card/40 text-foreground backdrop-blur-sm"
        data-slot="hyperion-footer-panel"
      >
        <BorderTrace radius={PANEL_RADIUS} />

        <div className={`${wordmarkFont.variable} p-8 md:p-12`}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <Link className="font-display text-foreground text-lg tracking-tight" href="/">
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

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-border/50 border-t pt-6 sm:flex-row">
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

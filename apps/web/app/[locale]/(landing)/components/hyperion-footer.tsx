"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { GradientBand } from "./gradient-band";

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
      { label: "Changelog", href: "/news" },
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
    <footer className="bg-mistral-cream text-mistral-ink" data-slot="hyperion-footer">
      <div className="mx-auto max-w-7xl px-6 py-section">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link
              className="font-display text-heading-4 text-mistral-ink"
              href="/"
            >
              Hyperion
            </Link>
            <p className="mt-3 max-w-xs text-body-sm text-mistral-steel">
              The agentic workspace for autonomous software development.
            </p>
            <div className="mt-6 flex gap-4">
              <Link aria-label="GitHub" className="text-mistral-steel transition-colors hover:text-mistral-primary" href="#">
                <Github className="size-5" />
              </Link>
              <Link aria-label="Twitter" className="text-mistral-steel transition-colors hover:text-mistral-primary" href="#">
                <Twitter className="size-5" />
              </Link>
              <Link aria-label="LinkedIn" className="text-mistral-steel transition-colors hover:text-mistral-primary" href="#">
                <Linkedin className="size-5" />
              </Link>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-micro-uppercase text-mistral-slate">{section.title}</h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-body-sm text-mistral-primary transition-colors hover:text-mistral-primary-deep"
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-mistral-beige-deep pt-8 sm:flex-row">
          <p className="text-micro text-mistral-steel">
            &copy; {new Date().getFullYear()} Hyperion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

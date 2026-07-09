"use client";

import { CornerBrackets } from "../components/motion-primitives";
import { FAQ } from "@workspace/ui/components/marketing/faq";
import { MarketingCard } from "@workspace/ui/components/marketing/card";
import { GradientBand } from "../components/gradient-band";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Sparkles, Users, Bot, Eye } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    name: "Developer",
    icon: Bot,
    description: "Individual contributors building with AI agents.",
    features: [
      "Up to 4 tiled terminal panes",
      "AI agent task dispatch",
      "Monaco code editor",
      "File browser",
      "Community support",
    ],
    cta: "Start free",
    href: "/contact",
  },
  {
    name: "Team Lead",
    icon: Users,
    description: "Lead development teams with orchestrated agent workflows.",
    features: [
      "Up to 8 terminal panes",
      "Kanban task board",
      "Canvas overlay for agent traces",
      "Team workspace & analytics",
      "Priority support",
    ],
    cta: "Start trial",
    href: "/contact",
  },
  {
    name: "AI Agent Seat",
    icon: Sparkles,
    description: "Dedicated autonomous agent seat for your swarm pipeline.",
    features: [
      "Full 16-pane terminal grid",
      "Autonomous agent dispatch & resolution",
      "Dependency resolution engine",
      "Prompt Forge & versioning",
      "SSO & role-based access",
      "Dedicated agent runtime",
    ],
    cta: "Get early access",
    href: "/contact",
    featured: true,
  },
  {
    name: "Viewer",
    icon: Eye,
    description: "Read-only access for stakeholders and reviewers.",
    features: [
      "View terminal sessions (live/replay)",
      "Kanban board read-only",
      "Canvas trace viewer",
      "Export session logs",
      "Free forever",
    ],
    cta: "Join waitlist",
    href: "/contact",
  },
];

const faqItems = [
  {
    question: "Can I switch roles at any time?",
    answer:
      "Yes, you can upgrade or change your role at any time. Changes take effect immediately. Viewers can upgrade to Developer or Team Lead with a single click.",
  },
  {
    question: "Is there a free trial for paid roles?",
    answer:
      "Developer and Team Lead roles come with a 14-day free trial. The AI Agent seat is currently in early access — join the waitlist and get priority when it launches.",
  },
  {
    question: "What happens to my data when I change roles?",
    answer:
      "Your workspace, terminals, tasks, and canvas traces are preserved across role changes. Nothing is lost — only capabilities expand or contract.",
  },
  {
    question: "Can teams mix different roles?",
    answer:
      "Absolutely. A team can have Developers, a Team Lead, and a Viewer all collaborating on the same workspace. Each member gets the interface their role provides.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-section">
        <div
          aria-hidden={true}
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(135deg, #ffa110 0%, #ff8a00 60%, #fa520f 10%)",
          }}
        />
        <div
          aria-hidden={true}
          className="absolute inset-0 -z-10 bg-gradient-to-r from-white/40 to-transparent"
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-display text-heading-1 text-mistral-ink">
            Choose your role.
          </h1>
          <p className="mt-4 text-subtitle text-mistral-ink-tint">
            Hyperion adapts to how you work — from solo developer to team
            orchestrator to autonomous agent operator.
          </p>
        </div>
      </section>

      {/* Role-tier cards */}
      <section className="mx-auto max-w-7xl px-6 pb-section-lg pt-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <MarketingCard
                key={role.name}
                variant={role.featured ? "cream" : "base"}
                padding="xxl"
                className={cn(
                  "relative flex flex-col",
                  role.featured && "border-2 border-mistral-primary"
                )}
              >
                {role.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-mistral-primary px-4 py-1 text-caption-bold text-mistral-on-primary whitespace-nowrap">
                    Flagship role
                  </span>
                )}
                <Icon className="size-8 text-mistral-primary" />
                <h3 className="mt-4 text-heading-4 text-mistral-ink">
                  {role.name}
                </h3>
                <p className="mt-1 text-body-sm text-mistral-slate">
                  {role.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {role.features.map((f) => (
                    <li className="flex items-start gap-2 text-body-sm text-mistral-ink-tint" key={f}>
                      <Check className="mt-0.5 size-4 shrink-0 text-mistral-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="relative mt-8">
                  <Link
                    className={cn(
                      "inline-flex h-10 w-full items-center justify-center rounded-md px-5 text-button-md transition-all duration-150 active:scale-[0.98]",
                      role.featured
                        ? "bg-mistral-primary text-mistral-on-primary hover:bg-mistral-primary-deep hover:scale-[1.02]"
                        : "border border-mistral-hairline-strong bg-mistral-canvas text-mistral-ink hover:bg-mistral-surface hover:scale-[1.02]"
                    )}
                    href={role.href}
                  >
                    {role.cta}
                  </Link>
                  {role.featured && (
                    <CornerBrackets
                      className="pointer-events-none absolute inset-0"
                      color="#fa520f"
                      size={12}
                      strokeWidth={2}
                    />
                  )}
                </div>
              </MarketingCard>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-section-lg">
        <h2 className="text-center font-display text-heading-1 text-mistral-ink">
          Frequently asked questions
        </h2>
        <div className="mt-10">
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* Thin gradient band */}
      <div className="pb-section-lg">
        <GradientBand variant="thin" />
      </div>
    </>
  );
}

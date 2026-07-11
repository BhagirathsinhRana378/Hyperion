"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Bot, Check, Eye, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Badge, Eyebrow, FAQ, GlowCard } from "../components/marketing-kit";
import {
  revealVariants,
  staggerContainer,
} from "../components/motion-primitives";
import { ParallaxField } from "../components/parallax-field";

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
    <div className="relative">
      {/* 3D parallax background — grid floor + depth-layered shapes */}
      <ParallaxField />

      {/* Hero */}
      <section className="relative pt-36 pb-16">
        <motion.div
          animate="visible"
          className="relative mx-auto max-w-3xl px-6 text-center"
          initial="hidden"
          variants={staggerContainer}
        >
          <motion.div variants={revealVariants}>
            <Eyebrow>Roles</Eyebrow>
          </motion.div>
          <motion.h1
            className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl"
            variants={revealVariants}
          >
            Choose your role.
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            variants={revealVariants}
          >
            Hyperion adapts to how you work — from solo developer to team
            orchestrator to autonomous agent operator.
          </motion.p>
        </motion.div>
      </section>

      {/* Role-tier cards */}
      <section className="mx-auto max-w-7xl px-6 pt-8 pb-20 md:pb-28">
        <motion.div
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-60px" }}
          whileInView="visible"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div key={role.name} variants={revealVariants}>
                <GlowCard
                  beam={role.featured}
                  className={cn(
                    "flex h-full flex-col p-8",
                    role.featured &&
                      "border-primary/50 shadow-[0_0_40px_-12px] shadow-primary/20"
                  )}
                >
                  {role.featured && (
                    <Badge className="absolute -top-0 right-6" variant="solid">
                      Flagship role
                    </Badge>
                  )}
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-secondary">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-5 font-medium text-foreground text-lg">
                    {role.name}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {role.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {role.features.map((f) => (
                      <li
                        className="flex items-start gap-2 text-foreground/75 text-sm"
                        key={f}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    className={cn(
                      "mt-8 inline-flex h-10 w-full items-center justify-center rounded-full px-5 font-medium text-sm transition-all duration-200 active:scale-[0.98]",
                      role.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/85 hover:shadow-[0_0_24px_-4px] hover:shadow-primary/40"
                        : "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-muted/50"
                    )}
                    href={role.href}
                  >
                    {role.cta}
                  </Link>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-24 md:pb-32">
        <div className="text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 font-display text-3xl text-foreground tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-10">
          <FAQ items={faqItems} />
        </div>
      </section>
    </div>
  );
}

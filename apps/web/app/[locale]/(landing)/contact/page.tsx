"use client";

import { Mail, Sparkles, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ContactBackdrop } from "../components/contact-backdrop";
import { GlowCard, Input, Textarea } from "../components/marketing-kit";
import {
  easeOut,
  revealVariants,
  staggerContainer,
} from "../components/motion-primitives";

const fieldStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
  },
};

const fieldReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easeOut },
  },
};

const sidebarItems = [
  {
    icon: Mail,
    title: "Email",
    body: "hello@hyperion.dev",
  },
  {
    icon: Sparkles,
    title: "Hackathon pilot",
    body: "Running a hackathon? We offer free team workspaces for the event duration. Mention it in your message.",
  },
  {
    icon: Terminal,
    title: "Open source",
    body: "Hyperion is built in the open. Contribute on GitHub or join our community.",
  },
];

export default function ContactPage() {
  const reduceMotion = useReducedMotion();
  const initialState = reduceMotion ? "visible" : "hidden";

  return (
    <div className="relative">
      <ContactBackdrop />

      {/* Header */}
      <section className="relative mx-auto max-w-3xl px-6 pt-36 text-center">
        <div
          aria-hidden={true}
          className="landing-glow-breathe pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent)_0%,transparent_70%)]"
        />
        <motion.div
          animate="visible"
          initial={initialState}
          variants={staggerContainer}
        >
          <motion.div variants={revealVariants}>
          </motion.div>
          <motion.h1
            className="mt-3 font-display text-4xl text-foreground tracking-tighter md:text-6xl"
            variants={revealVariants}
          >
            Request workspace access.
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            variants={revealVariants}
          >
            Trying out Hyperion for your team, a hackathon, or your own
            development workflow — fill out the details and we&apos;ll get you
            set up.
          </motion.p>
        </motion.div>
      </section>

      {/* Form + Info */}
      <section className="mx-auto max-w-5xl px-6 pt-14 pb-24 md:pb-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <GlowCard className="max-w-lg p-8 md:p-10" tilt={false}>
            <motion.form
              animate="visible"
              className="space-y-6"
              initial={initialState}
              onSubmit={(e) => e.preventDefault()}
              variants={fieldStagger}
            >
              <motion.div variants={fieldReveal}>
                <Input
                  id="name"
                  label="Name"
                  placeholder="Your name"
                  required
                  type="text"
                />
              </motion.div>
              <motion.div variants={fieldReveal}>
                <Input
                  id="email"
                  label="Email"
                  placeholder="you@company.com"
                  required
                  type="email"
                />
              </motion.div>
              <motion.div variants={fieldReveal}>
                <Input
                  id="role"
                  label="Role"
                  placeholder="Developer / Team Lead / Researcher"
                  type="text"
                />
              </motion.div>
              <motion.div variants={fieldReveal}>
                <Input
                  id="team-size"
                  label="Team size"
                  placeholder="1-5, 5-20, 20+"
                  type="text"
                />
              </motion.div>
              <motion.div variants={fieldReveal}>
                <Textarea
                  id="use-case"
                  label="Tell us about your project"
                  placeholder="Hackathon, personal dev environment, team workspace, research..."
                  required
                />
              </motion.div>
              <motion.div variants={fieldReveal}>
                <button
                  className="landing-ease-emphasized inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 font-medium text-primary-foreground text-sm transition-[filter,transform,box-shadow] duration-200 hover:scale-[1.015] hover:shadow-[0_0_28px_-6px] hover:shadow-primary/50 hover:brightness-110 active:scale-[0.98] active:duration-100 active:brightness-100"
                  type="submit"
                >
                  Request access
                </button>
              </motion.div>
            </motion.form>
          </GlowCard>

          {/* Sidebar */}
          <motion.div
            animate="visible"
            className="space-y-8"
            initial={initialState}
            transition={{ delayChildren: 0.25 }}
            variants={staggerContainer}
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  className="group/sidecard relative flex max-w-sm items-start gap-4"
                  key={item.title}
                  variants={revealVariants}
                >
                  {/* Hover surface — absolutely positioned so it never
                      affects the card's own box geometry/spacing. */}
                  <div
                    aria-hidden={true}
                    className="-inset-3 pointer-events-none absolute rounded-xl border border-transparent transition-[border-color,background-color] duration-200 ease-out group-hover/sidecard:border-border/60 group-hover/sidecard:bg-secondary/40"
                  />
                  <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-[transform,border-color,box-shadow] duration-200 ease-out group-hover/sidecard:-rotate-2 group-hover/sidecard:scale-[1.03] group-hover/sidecard:border-primary/40 group-hover/sidecard:shadow-[0_0_16px_-4px] group-hover/sidecard:shadow-primary/40">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="relative">
                    <h4 className="font-medium text-foreground text-sm">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

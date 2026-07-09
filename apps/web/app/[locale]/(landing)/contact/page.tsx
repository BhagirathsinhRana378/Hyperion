"use client";

import { MarketingCard } from "@workspace/ui/components/marketing/card";
import { MarketingInput, MarketingTextarea } from "@workspace/ui/components/marketing/form-fields";
import { GradientBand } from "../components/gradient-band";
import { CornerBrackets } from "../components/motion-primitives";
import { Mail, Sparkles, Terminal } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="mx-auto max-w-3xl px-6 pt-32 text-center">
        <h1 className="font-display text-heading-1 text-mistral-ink">
          Request workspace access.
        </h1>
        <p className="mt-4 text-subtitle text-mistral-slate">
          Trying out Hyperion for your team, a hackathon, or your own
          development workflow — fill out the details and we&apos;ll get you
          set up.
        </p>
      </section>

      {/* Form + Info */}
      <section className="mx-auto max-w-5xl px-6 pb-section-lg pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          {/* Request access panel — cream */}
          <MarketingCard variant="cream" padding="xxl" className="max-w-lg">
            <form
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
              <MarketingInput id="name" label="Name" placeholder="Your name" required type="text" />
              <MarketingInput id="email" label="Email" placeholder="you@company.com" required type="email" />
              <MarketingInput id="role" label="Role" placeholder="Developer / Team Lead / Researcher" type="text" />
              <MarketingInput id="team-size" label="Team size" placeholder="1-5, 5-20, 20+" type="text" />
              <MarketingTextarea id="use-case" label="Tell us about your project" placeholder="Hackathon, personal dev environment, team workspace, research..." required />
              <div className="relative">
                <button
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-mistral-ink px-5 text-button-md text-mistral-on-dark transition-all duration-150 hover:bg-mistral-charcoal hover:scale-[1.02] active:scale-[0.98]"
                  type="submit"
                >
                  Request access
                </button>
                <CornerBrackets
                  className="pointer-events-none absolute inset-0"
                  color="#1f1f1f"
                  size={10}
                  strokeWidth={2}
                />
              </div>
            </form>
          </MarketingCard>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Mail className="mt-1 size-5 text-mistral-primary" />
              <div>
                <h4 className="text-body-md-medium text-mistral-ink">Email</h4>
                <p className="text-body-sm text-mistral-steel">hello@hyperion.dev</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Sparkles className="mt-1 size-5 text-mistral-primary" />
              <div>
                <h4 className="text-body-md-medium text-mistral-ink">Hackathon pilot</h4>
                <p className="text-body-sm text-mistral-steel">
                  Running a hackathon? We offer free team workspaces for the
                  event duration. Mention it in your message.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Terminal className="mt-1 size-5 text-mistral-primary" />
              <div>
                <h4 className="text-body-md-medium text-mistral-ink">Open source</h4>
                <p className="text-body-sm text-mistral-steel">
                  Hyperion is built in the open. Contribute on GitHub or join
                  our community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-section-lg">
        <GradientBand variant="thin" />
      </div>
    </>
  );
}

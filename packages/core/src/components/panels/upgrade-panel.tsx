"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { BorderBeam } from "@workspace/ui/components/landing/border-beam";
import {
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface FAQItem {
  answer: string;
  question: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel at any time from the billing panel. You will retain access to your Pro features until the end of your current billing cycle.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We support all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay.",
  },
  {
    question: "Does the license transfer to mobile and desktop?",
    answer:
      "Absolutely! Your Hyperion Pro subscription covers all targets. Your account syncs settings, workspaces, and licenses across web, macOS, Windows, Linux, iOS, and Android.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Yes, we offer a 14-day free trial on the Pro annual plan. You can cancel anytime before the trial ends and you won't be charged.",
  },
];

export function UpgradePanel() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-10 pb-8">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-semibold text-primary text-xs uppercase tracking-wider">
              <Sparkles className="size-3" />
              Introducing Hyperion Pro
            </div>
            <h3 className="font-bold text-2xl text-foreground tracking-tight md:text-3xl">
              Unlock the Ultimate Developer Workspace
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Supercharge your setup with unlimited terminal sessions, cloud
              sync, advanced AI assistance, and exclusive access to all 40+
              designer themes.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex size-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-md">
              <Sparkles className="size-10 animate-pulse text-primary" />
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Billing Switcher */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex rounded-lg bg-muted p-1">
          <button
            className={`rounded-md px-4 py-1.5 font-semibold text-xs transition-all ${
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingCycle("monthly")}
            type="button"
          >
            Monthly
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 font-semibold text-xs transition-all ${
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingCycle("yearly")}
            type="button"
          >
            Yearly
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-[9px] text-primary uppercase tracking-normal">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tier 1: Free */}
        <Card className="flex flex-col justify-between border-border/40 transition-shadow duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Standard</CardTitle>
            <CardDescription className="text-xs">
              Perfect for getting started
            </CardDescription>
            <div className="mt-4 flex items-baseline">
              <span className="font-bold font-mono text-3xl text-foreground tracking-tight">
                $0
              </span>
              <span className="ml-1 text-muted-foreground text-xs">
                / forever
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Up to 3 Workspaces</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Max 4 Terminals per grid</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Standard Color Themes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Local Session Cache</span>
              </li>
            </ul>
            <Button
              className="mt-4 w-full font-bold text-xs shadow-xs"
              variant="outline"
            >
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Tier 2: Pro (Featured) */}
        <Card className="relative flex scale-[1.02] flex-col justify-between border-primary/50 bg-primary/5 shadow-lg md:scale-105">
          <BorderBeam
            className="from-transparent via-primary to-transparent"
            duration={6}
            size={150}
          />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-primary">
                Pro Developer
              </CardTitle>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 font-bold font-mono text-[9px] text-primary uppercase tracking-wider">
                Popular
              </span>
            </div>
            <CardDescription className="text-xs">
              Advanced toolset for professionals
            </CardDescription>
            <div className="mt-4 flex items-baseline text-foreground">
              <span className="font-bold font-mono text-3xl tracking-tight">
                {billingCycle === "yearly" ? "$12" : "$15"}
              </span>
              <span className="ml-1 text-muted-foreground text-xs">
                / month
              </span>
            </div>
            {billingCycle === "yearly" && (
              <span className="font-medium text-[10px] text-primary">
                Billed annually ($144/yr)
              </span>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">
                  Unlimited Workspaces & Projects
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">
                  Up to 8 Terminals per grid
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">
                  All 40+ Designer Themes
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">
                  Secure Cloud Configurations Sync
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">
                  Early Access to New Releases
                </span>
              </li>
            </ul>
            <div className="mt-4 space-y-2">
              <Button className="w-full font-bold text-xs shadow-md shadow-primary/20">
                Upgrade Now
              </Button>
              <Button className="w-full text-xs" variant="link">
                Restore Purchase
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tier 3: Enterprise */}
        <Card className="flex flex-col justify-between border-border/40 transition-shadow duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Enterprise</CardTitle>
            <CardDescription className="text-xs">
              Custom requirements & support
            </CardDescription>
            <div className="mt-4 flex items-baseline">
              <span className="font-bold font-mono text-3xl text-foreground tracking-tight">
                Custom
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>SAML Single Sign-On (SSO)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Dedicated Priority SLA Support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span>Custom Team Billing Management</span>
              </li>
            </ul>
            <Button
              className="mt-4 w-full font-bold text-xs shadow-xs"
              variant="outline"
            >
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <div className="space-y-3">
        <div className="font-bold font-sans text-foreground text-sm uppercase tracking-wider">
          Features Comparison
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-border/40 border-b bg-muted/30 font-semibold">
                <th className="p-3">Feature</th>
                <th className="p-3 text-center">Standard</th>
                <th className="p-3 text-center text-primary">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              <tr>
                <td className="p-3 font-medium">Workspaces Limits</td>
                <td className="p-3 text-center text-muted-foreground">
                  Up to 3
                </td>
                <td className="p-3 text-center font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Max Grid Terminals</td>
                <td className="p-3 text-center text-muted-foreground">
                  4 sessions
                </td>
                <td className="p-3 text-center font-semibold">8 sessions</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Themes Access</td>
                <td className="p-3 text-center text-muted-foreground">
                  Standard only
                </td>
                <td className="p-3 text-center font-semibold">
                  All 40+ variants
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Workspace Sync</td>
                <td className="p-3 text-center text-muted-foreground">
                  Local storage only
                </td>
                <td className="p-3 text-center font-semibold">
                  Cloud automated sync
                </td>
              </tr>
              <tr>
                <td className="p-3 font-medium">AI Terminal Assistant</td>
                <td className="p-3 text-center text-muted-foreground">
                  10 queries/day
                </td>
                <td className="p-3 text-center font-semibold">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-bold font-sans text-foreground text-sm uppercase tracking-wider">
          <HelpCircle className="size-4 text-primary" />
          Frequently Asked Questions
        </div>
        <div className="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/40 bg-muted/10">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div className="bg-background/25" key={faq.question}>
                <button
                  className="flex w-full items-center justify-between p-4 text-left font-semibold text-foreground text-xs transition-colors hover:bg-muted/40"
                  onClick={() => toggleFaq(index)}
                  type="button"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-muted-foreground text-xs leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
} from "lucide-react";

interface Invoice {
  amount: string;
  date: string;
  id: string;
  status: "Paid" | "Pending";
}

const INVOICES: Invoice[] = [
  {
    date: "Jul 01, 2026",
    id: "INV-2026-004",
    amount: "$12.00",
    status: "Paid",
  },
  {
    date: "Jun 01, 2026",
    id: "INV-2026-003",
    amount: "$12.00",
    status: "Paid",
  },
  {
    date: "May 01, 2026",
    id: "INV-2026-002",
    amount: "$12.00",
    status: "Paid",
  },
  {
    date: "Apr 01, 2026",
    id: "INV-2026-001",
    amount: "$12.00",
    status: "Paid",
  },
];

export function BillingPanel() {
  return (
    <div className="space-y-6 pb-8">
      {/* Current Subscription Header */}
      <Card className="border-border/40 bg-muted/5">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm uppercase tracking-wider">
                  Current Plan
                </span>
                <Badge className="h-5 border border-primary/20 bg-primary/15 px-2 font-semibold text-[9px] text-primary uppercase">
                  Pro Developer
                </Badge>
              </div>
              <h3 className="font-bold font-mono text-2xl text-foreground tracking-tight">
                $12.00
                <span className="font-normal text-muted-foreground text-xs">
                  {" "}
                  / month
                </span>
              </h3>
              <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Calendar className="size-3.5 text-primary" />
                Next renewal date:{" "}
                <span className="font-semibold text-foreground">
                  August 01, 2026
                </span>{" "}
                (via Mastercard ending in 4242)
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button className="h-9 text-xs" variant="outline">
                Cancel Subscription
              </Button>
              <Button className="h-9 font-bold text-xs shadow-xs">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics Grid */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="font-bold text-sm uppercase tracking-wider">
            Plan Usage Limits
          </CardTitle>
          <CardDescription className="text-xs">
            Monitor your workspace consumption and terminal session allocations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terminals Allocation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Grid Terminals Opened
              </span>
              <span className="font-mono font-semibold text-foreground">
                5 / 8 Sessions
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: "62.5%" }}
              />
            </div>
          </div>

          {/* Workspaces Limits */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Workspaces Created
              </span>
              <span className="font-mono font-semibold text-foreground">
                3 / Unlimited
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: "25%" }}
              />
            </div>
          </div>

          {/* Cloud Config Storage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Cloud Settings Backup
              </span>
              <span className="font-mono font-semibold text-foreground">
                120 KB / 5 MB
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/50"
                style={{ width: "2.4%" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Glassmorphic Credit Card Preview */}
        <Card className="relative flex flex-col justify-between overflow-hidden border-border/40 md:col-span-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
              <CreditCard className="size-4.5 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4">
            {/* The Credit Card Graphic */}
            <div className="relative flex aspect-15/9 w-full max-w-sm flex-col justify-between overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-primary/30 via-secondary/10 to-background p-5 shadow-lg">
              <div className="relative z-10 flex items-center justify-between">
                {/* Gold chip mockup */}
                <div className="flex h-7 w-10 flex-col justify-between rounded-sm border border-yellow-500/20 bg-linear-to-br from-yellow-400/40 via-yellow-600/30 to-yellow-800/20 p-1">
                  <div className="h-px w-full bg-yellow-500/20" />
                  <div className="h-px w-full bg-yellow-500/20" />
                </div>
                <span className="font-bold font-mono text-primary/70 text-sm tracking-widest">
                  Mastercard
                </span>
              </div>
              <div className="relative z-10 my-3 text-center font-medium font-mono text-base text-foreground tracking-widest">
                •••• •••• •••• 4242
              </div>
              <div className="relative z-10 flex items-center justify-between font-semibold text-micro text-muted-foreground uppercase">
                <div className="flex flex-col">
                  <span>Cardholder</span>
                  <span className="mt-0.5 text-foreground tracking-tight">
                    Bhagirathsinh Rana
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span>Expires</span>
                  <span className="mt-0.5 text-foreground">12 / 29</span>
                </div>
              </div>
              {/* Blur gradient bubbles inside card */}
              <div className="absolute -bottom-10 -left-10 size-24 rounded-full bg-primary/10 blur-xl" />
              <div className="absolute top-0 right-0 size-20 rounded-full bg-secondary/15 blur-lg" />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button className="h-8 text-xs" size="sm" variant="outline">
                Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Details */}
        <Card className="flex flex-col justify-between border-border/40 md:col-span-6">
          <CardHeader>
            <CardTitle className="font-bold text-sm uppercase tracking-wider">
              Billing Contact Address
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4">
            <div className="space-y-1.5 text-muted-foreground text-xs leading-relaxed">
              <p className="font-semibold text-foreground">
                Bhagirathsinh Rana
              </p>
              <p>12, Sunrise Avenue, Ring Road</p>
              <p>Mumbai, Maharashtra 400001</p>
              <p>India</p>
              <p className="flex items-center gap-1.5 pt-2">
                Email:{" "}
                <span className="font-semibold text-foreground">
                  billing@example.com
                </span>
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button className="h-8 text-xs" size="sm" variant="outline">
                Update Address
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History List */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="font-bold text-sm uppercase tracking-wider">
            Payment Invoice History
          </CardTitle>
          <CardDescription className="text-xs">
            Access past receipts and download historical invoice reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-border/40 border-b bg-muted/20 font-semibold">
                  <th className="p-3 pl-6">Invoice ID</th>
                  <th className="p-3">Billing Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {INVOICES.map((inv) => (
                  <tr
                    className="transition-colors hover:bg-muted/15"
                    key={inv.id}
                  >
                    <td className="flex items-center gap-1 p-3 pl-6 font-mono font-semibold text-foreground">
                      {inv.id}
                      <ExternalLink className="size-3 text-muted-foreground/60" />
                    </td>
                    <td className="p-3 text-muted-foreground">{inv.date}</td>
                    <td className="p-3 font-medium text-foreground">
                      {inv.amount}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-micro text-emerald-400">
                        <CheckCircle2 className="size-3 text-emerald-400" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 pr-6 text-right">
                      <Button
                        className="h-7 px-2 font-semibold text-micro"
                        size="sm"
                        variant="ghost"
                      >
                        <Download className="mr-1 size-3.5" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

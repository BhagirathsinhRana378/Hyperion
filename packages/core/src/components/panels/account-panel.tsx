"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  AlertTriangle,
  Github,
  Globe,
  KeyRound,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AccountPanel() {
  const [displayName, setDisplayName] = useState("Bhagirathsinh Rana");
  const [username, setUsername] = useState("bhagirath_rana");
  const [email, setEmail] = useState("user@example.com");

  const handleSaveProfile = () => {
    toast.success("Profile details saved successfully.");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Profile Settings Card */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider">
            Profile Information
          </CardTitle>
          <CardDescription className="text-xs">
            Update your display avatar and personal profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar className="size-20 rounded-xl border border-border/40">
              <AvatarImage alt="User Avatar" src="/avatar.svg" />
              <AvatarFallback className="rounded-xl font-bold text-lg">
                BR
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button className="h-8 font-semibold text-xs" size="sm">
                  Upload New Avatar
                </Button>
                <Button className="h-8 text-xs" size="sm" variant="outline">
                  Remove
                </Button>
              </div>
              <p className="text-caption text-muted-foreground">
                JPG, PNG or SVG. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                className="font-semibold text-muted-foreground text-micro uppercase"
                htmlFor="display-name"
              >
                Display Name
              </Label>
              <Input
                className="h-9 text-xs"
                id="display-name"
                onChange={(e) => setDisplayName(e.target.value)}
                value={displayName}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="font-semibold text-muted-foreground text-micro uppercase"
                htmlFor="username"
              >
                Username
              </Label>
              <Input
                className="h-9 text-xs"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                className="font-semibold text-muted-foreground text-micro uppercase"
                htmlFor="email"
              >
                Email Address
              </Label>
              <Input
                className="h-9 text-xs"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                value={email}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              className="h-9 px-4 font-bold text-xs shadow-xs"
              onClick={handleSaveProfile}
            >
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider">
            Connected Accounts
          </CardTitle>
          <CardDescription className="text-xs">
            Manage third-party login providers integrated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* GitHub Connection */}
          <div className="flex items-center justify-between rounded-lg border border-border/20 bg-muted/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border-border bg-muted">
                <Github className="size-4 text-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-xs">
                  GitHub
                </span>
                <span className="text-caption text-muted-foreground">
                  Connected as @BhagirathsinhRana378
                </span>
              </div>
            </div>
            <Button className="h-8 text-xs" size="sm" variant="outline">
              Disconnect
            </Button>
          </div>

          {/* Google Connection */}
          <div className="flex items-center justify-between rounded-lg border border-border/20 bg-muted/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20">
                <Globe className="size-4 text-red-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-xs">
                  Google Account
                </span>
                <span className="text-caption text-muted-foreground">
                  Not connected
                </span>
              </div>
            </div>
            <Button className="h-8 font-semibold text-xs" size="sm">
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Authentication */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider">
            Security Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Update passwords, enable two-factor validation, and monitor devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-border/20 border-b py-2">
            <div className="flex items-center gap-3">
              <KeyRound className="size-4.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-xs">
                  Password Authentication
                </span>
                <span className="text-caption text-muted-foreground">
                  Last updated 3 months ago
                </span>
              </div>
            </div>
            <Button className="h-8 text-xs" size="sm" variant="outline">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between border-border/20 border-b py-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  Two-Factor Authentication (2FA)
                  <Badge className="h-4.5 border border-emerald-500/25 bg-emerald-500/10 px-1.5 font-semibold text-[8px] text-emerald-400">
                    Enabled
                  </Badge>
                </span>
                <span className="text-caption text-muted-foreground">
                  Verify login access via authenticator app
                </span>
              </div>
            </div>
            <Button className="h-8 text-xs" size="sm" variant="outline">
              Disable
            </Button>
          </div>

          {/* Active Sessions */}
          <div className="space-y-3 pt-2">
            <span className="block font-semibold text-muted-foreground text-micro uppercase tracking-wider">
              Active Device Sessions
            </span>
            <div className="space-y-2">
              <div className="flex items-start justify-between rounded-lg border border-border/20 bg-muted/5 p-3">
                <div className="flex items-start gap-3">
                  <Monitor className="mt-0.5 size-4.5 shrink-0 text-primary" />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                      Windows Desktop Client
                      <Badge className="h-4.5 border border-primary/20 bg-primary/15 px-1.5 font-semibold text-[8px] text-primary">
                        Current Session
                      </Badge>
                    </span>
                    <span className="text-caption text-muted-foreground">
                      Tauri WebView2 • Mumbai, India • IP: 192.168.1.5
                    </span>
                  </div>
                </div>
                <span className="text-caption text-muted-foreground">
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900/30 bg-red-950/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-red-400 text-sm uppercase tracking-wider">
            <AlertTriangle className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-900/60 text-xs dark:text-red-400/40">
            Irreversible actions regarding your account ownership and workspace
            setups.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <span className="font-semibold text-foreground text-xs">
              Delete Account
            </span>
            <p className="text-caption text-muted-foreground">
              Permanently purge all workspace sessions, PTY history cache,
              themes, and cloud data mappings.
            </p>
          </div>
          <Button className="h-9 px-4 font-bold text-xs" variant="destructive">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { siteConfig } from "@workspace/core/config/site";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  type LucideIcon,
  Settings,
  Sparkles,
} from "lucide-react";

export interface UserNavItem {
  avatar: string;
  email: string;
  name: string;
}

export interface ProfileNavItem {
  icon: LucideIcon;
  title: string;
  translationKey: string;
  url: string;
}

export interface ProfileNavGroup {
  id: string;
  items: ProfileNavItem[];
}

export interface SecondaryNavItem {
  external?: boolean;
  icon: LucideIcon;
  title: string;
  translationKey: string;
  url: string;
}

export interface NavigationData {
  navProfile: ProfileNavGroup[];
  navSecondary: SecondaryNavItem[];
  user: UserNavItem;
}

export const navigationData: NavigationData = {
  user: {
    name: siteConfig.owner,
    email: "user@example.com",
    avatar: "/avatar.svg",
  },
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      translationKey: "settings",
    },
  ],
  navProfile: [
    {
      id: "group-1",
      items: [
        {
          title: "Upgrade to Pro",
          url: "#upgrade",
          icon: Sparkles,
          translationKey: "upgradeToPro",
        },
      ],
    },
    {
      id: "group-2",
      items: [
        {
          title: "Account",
          url: "#account",
          icon: BadgeCheck,
          translationKey: "account",
        },
        {
          title: "Billing",
          url: "#billing",
          icon: CreditCard,
          translationKey: "billing",
        },
        {
          title: "Notifications",
          url: "#notifications",
          icon: Bell,
          translationKey: "notifications",
        },
      ],
    },
    {
      id: "group-3",
      items: [
        {
          title: "Log Out",
          url: "#logout",
          icon: LogOut,
          translationKey: "logOut",
        },
      ],
    },
  ],
};

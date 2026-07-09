"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Product", href: "/product" },
  { label: "Coding", href: "/coding" },
  { label: "Services", href: "/services" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
  { label: "Download", href: "/download" },
];

export function HyperionNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-[border-color] duration-200",
        scrolled
          ? "border-mistral-hairline-soft bg-mistral-canvas/80 shadow-mistral-level-1 backdrop-blur-md"
          : "border-transparent bg-mistral-canvas/80 backdrop-blur-md"
      )}
      data-slot="hyperion-nav"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          aria-label="Home"
          className="font-display text-heading-4 text-mistral-ink"
          href="/"
        >
          Hyperion
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                className="text-body-sm text-mistral-slate transition-colors duration-150 hover:text-mistral-primary"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md bg-mistral-primary px-4 text-button-md text-mistral-on-primary transition-all duration-150 hover:bg-mistral-primary-deep hover:scale-[1.02] active:scale-[0.98]"
            href="/contact"
          >
            Get access
          </Link>
        </div>

        {/* Mobile */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="relative z-20 flex cursor-pointer items-center lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          {menuOpen ? (
            <X className="size-6 text-mistral-ink" />
          ) : (
            <Menu className="size-6 text-mistral-ink" />
          )}
        </button>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 z-10 border-b border-mistral-hairline-soft bg-mistral-canvas px-6 pb-6 pt-2 shadow-lg lg:hidden">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="block py-2 text-body-md text-mistral-slate hover:text-mistral-primary"
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-mistral-hairline-soft pt-4">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-mistral-primary px-5 text-button-md text-mistral-on-primary transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                >
                  Get access
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

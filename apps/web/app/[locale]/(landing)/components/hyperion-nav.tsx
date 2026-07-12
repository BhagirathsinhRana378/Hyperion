"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Menu, X } from "lucide-react";
import { Unbounded } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const wordmarkFont = Unbounded({
  subsets: ["latin"],
  weight: ["600"],
});

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Download", href: "/download" },
];

export function HyperionNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 transition-[padding] duration-500 ease-out sm:px-6"
      style={{ paddingTop: scrolled ? 16 : 24 }}
    >
      <header
        className={cn(
          "pointer-events-auto relative w-full rounded-2xl transition-[max-width] duration-500 ease-out",
          scrolled ? "max-w-5xl" : "max-w-7xl"
        )}
        data-slot="hyperion-nav"
      >
        {/* Glass pill — invisible at rest (nav floats flush over the hero with
         * no box at all), fades in once scrolled. Faded via opacity rather
         * than toggling border/bg/blur classes directly so the whole glass
         * treatment cross-fades as one smooth GPU-cheap layer instead of
         * jumping between discrete utility values. */}
        <div
          aria-hidden={true}
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl border border-border/60 bg-background/55 shadow-black/30 shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-500 ease-out",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />
        {/* hairline sheen along the top edge — only reads once the glass pill is present */}
        <div
          aria-hidden={true}
          className={cn(
            "pointer-events-none absolute inset-x-4 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-foreground/25 to-transparent transition-opacity duration-500 ease-out",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />
        <nav
          className="relative mx-auto flex items-center justify-between px-6 transition-[height] duration-500 ease-out"
          style={{ height: scrolled ? 56 : 64 }}
        >
          <Link
            aria-label="Home"
            className="group/logo relative shrink-0"
            href="/"
          >
            <span
              className={cn(
                wordmarkFont.className,
                "bg-[length:200%_100%] bg-gradient-to-r from-primary via-muted-foreground to-primary bg-clip-text text-sm text-transparent tracking-[0.3em] transition-[background-position,letter-spacing] duration-700 ease-out group-hover/logo:bg-[position:100%_0%] group-hover/logo:tracking-[0.36em]"
              )}
            >
              HYPERION
            </span>
            <span
              aria-hidden={true}
              className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-primary/70 to-transparent transition-transform duration-500 ease-out group-hover/logo:scale-x-100"
            />
          </Link>

          {/* Desktop */}
          <ul className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active = pathname?.includes(link.href);
              return (
                <li key={link.href}>
                  <Link
                    className={cn(
                      "group/nav relative text-sm transition-colors duration-150 hover:text-primary",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                    href={link.href}
                  >
                    {link.label}
                    <span
                      aria-hidden={true}
                      className={cn(
                        "absolute -bottom-1 left-0 h-px bg-primary/70 transition-all duration-300 ease-out",
                        active ? "w-full" : "w-0 group-hover/nav:w-full"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              className="group/btn relative inline-flex h-8 items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground text-sm transition-all duration-300 active:scale-[0.98]"
              href="/contact"
            >
              Get access
              <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                <defs>
                  <linearGradient id="shiny-gold-desktop" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#FDE047" />
                    <stop offset="65%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#854D0E" />
                  </linearGradient>
                </defs>
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  ry="12"
                  pathLength="100"
                  stroke="url(#shiny-gold-desktop)"
                  className="transition-[stroke-dasharray] duration-500 ease-out [stroke-dasharray:0_100] [stroke-dashoffset:-12.5] group-hover/btn:[stroke-dasharray:55_45]"
                  strokeWidth="1.5"
                />
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="12"
                  ry="12"
                  pathLength="100"
                  stroke="url(#shiny-gold-desktop)"
                  className="transition-[stroke-dasharray] duration-500 ease-out [stroke-dasharray:0_100] [stroke-dashoffset:-12.5] group-hover/btn:[stroke-dasharray:55_45] origin-center scale-x-[-1]"
                  strokeWidth="1.5"
                />
              </svg>
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
              <X className="size-5 text-foreground" />
            ) : (
              <Menu className="size-5 text-foreground" />
            )}
          </button>
        </nav>

        {menuOpen && (
          <div className="absolute inset-x-0 top-full z-10 mt-2 rounded-2xl border border-border/60 bg-background/80 px-6 pt-4 pb-6 shadow-black/30 shadow-lg backdrop-blur-xl lg:hidden">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="block py-1 text-foreground/80 text-sm hover:text-primary"
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-border/60 border-t pt-4">
                <Link
                  className="group/btn relative inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 font-medium text-primary-foreground text-sm transition-all duration-300 active:scale-[0.98]"
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                >
                  Get access
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                    <defs>
                      <linearGradient id="shiny-gold-mobile" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="25%" stopColor="#FDE047" />
                        <stop offset="65%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#854D0E" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="1"
                      y="1"
                      width="calc(100% - 2px)"
                      height="calc(100% - 2px)"
                      rx="12"
                      ry="12"
                      pathLength="100"
                      stroke="url(#shiny-gold-mobile)"
                      className="transition-[stroke-dasharray] duration-500 ease-out [stroke-dasharray:0_100] [stroke-dashoffset:-12.5] group-hover/btn:[stroke-dasharray:55_45]"
                      strokeWidth="1.5"
                    />
                    <rect
                      x="1"
                      y="1"
                      width="calc(100% - 2px)"
                      height="calc(100% - 2px)"
                      rx="12"
                      ry="12"
                      pathLength="100"
                      stroke="url(#shiny-gold-mobile)"
                      className="transition-[stroke-dasharray] duration-500 ease-out [stroke-dasharray:0_100] [stroke-dashoffset:-12.5] group-hover/btn:[stroke-dasharray:55_45] origin-center scale-x-[-1]"
                      strokeWidth="1.5"
                    />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

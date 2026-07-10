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
  { label: "Product", href: "/product" },
  { label: "Coding", href: "/coding" },
  { label: "Services", href: "/services" },
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
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 transition-[padding] duration-500 ease-out"
      style={{ paddingTop: scrolled ? 12 : 20 }}
    >
      <header
        className={cn(
          "pointer-events-auto w-full rounded-2xl border transition-[max-width,background-color,border-color,box-shadow] duration-500 ease-out",
          "border-border/60 bg-background/55 shadow-black/30 shadow-lg backdrop-blur-xl backdrop-saturate-150",
          scrolled ? "max-w-3xl" : "max-w-6xl"
        )}
        data-slot="hyperion-nav"
      >
        {/* hairline sheen along the top edge — glass catching light */}
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-x-4 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
        />
        <nav
          className="mx-auto flex items-center justify-between px-5 transition-[height] duration-500 ease-out"
          style={{ height: scrolled ? 48 : 60 }}
        >
          <Link aria-label="Home" className="group/logo relative shrink-0" href="/">
            <span
              className={cn(
                wordmarkFont.className,
                "bg-[length:200%_100%] bg-clip-text bg-gradient-to-r from-primary via-muted-foreground to-primary text-transparent tracking-[0.3em] transition-[background-position,letter-spacing,font-size] duration-700 ease-out group-hover/logo:bg-[position:100%_0%] group-hover/logo:tracking-[0.36em]",
                scrolled ? "text-xs" : "text-sm"
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
              className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 font-medium text-primary-foreground text-sm transition-all duration-150 hover:bg-primary/85 hover:scale-[1.03] active:scale-[0.98]"
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
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 font-medium text-primary-foreground text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                >
                  Get access
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

---
version: alpha
name: Hyperion-marketing-design
description: Visual style system for Hyperion's marketing/informational pages (Product, Le Studio, Coding, Services, Contact, News) — adapted from Mistral AI's sunset-gradient editorial style for reference purposes only. This file governs marketing surfaces ONLY, not Hyperion's in-app product UI (terminal grid, Kanban board, code editor, Theme Engine's 40+ OKLCh themes, command palette) — those get their own design system later. Style signature: atmospheric sunset gradients (mustard, orange, deep red), warm cream-yellow surfaces ({colors.cream}) with a saturated orange primary CTA ({colors.primary}), and an elegant near-serif voice for hero displays. Coverage spans Product page (hero), Le Studio page, Coding Solutions page, News article surfaces, Contact/request-access form, and Services (role-tier) page — all anchored by the signature gradient closing band.

colors:
  primary: "#fa520f"
  primary-deep: "#cc3a05"
  on-primary: "#ffffff"
  sunshine-300: "#ffd06a"
  sunshine-500: "#ffb83e"
  sunshine-700: "#ffa110"
  sunshine-800: "#ff8105"
  sunshine-900: "#ff8a00"
  yellow-saturated: "#ffd900"
  cream: "#fff8e0"
  cream-light: "#fffaeb"
  cream-deeper: "#fff0c2"
  beige-deep: "#e6d5a8"
  block-5: "#ffe295"
  block-6: "#ffd900"
  block-7: "#ff8105"
  ink: "#1f1f1f"
  ink-tint: "#3d3d3d"
  charcoal: "#2c2c2c"
  slate: "#4a4a4a"
  steel: "#6a6a6a"
  stone: "#8a8a8a"
  muted: "#a8a8a8"
  hairline: "#e5e5e5"
  hairline-soft: "#ededed"
  hairline-strong: "#c7c7c7"
  canvas: "#ffffff"
  surface: "#fafafa"
  surface-cream: "#fff8e0"
  surface-cream-soft: "#fffaeb"
  surface-code: "#1c1c1e"
  on-dark: "#ffffff"
  on-dark-muted: "#a8a8a8"
  on-cream: "#1f1f1f"
  footer-cream: "#fff8e0"
  link: "#fa520f"

typography:
  hero-display:
    fontFamily: Fraunces
    fontFamilyAlt: PP Editorial Old
    fontSize: 84px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -1.5px
    note: "Fraunces (Google Fonts, free) is the default near-serif display face. PP Editorial Old is a paid Pangram Pangram license — swap in only if you own it."
  display-lg:
    fontFamily: Fraunces
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.10
    letterSpacing: -1px
  heading-1:
    fontFamily: Fraunces
    fontSize: 52px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.5px
  heading-2:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: -0.5px
  heading-3:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.25
  heading-4:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.30
  heading-5:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.40
  subtitle:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-md-medium:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.55
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
  body-sm-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.50
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
  caption-bold:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.40
  micro:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
  micro-uppercase:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: 1px
  button-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.30
  stat-display:
    fontFamily: Fraunces
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.10
    letterSpacing: -1px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section-sm: 48px
  section: 64px
  section-lg: 96px
  hero: 120px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-primary-disabled:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.muted}"
  button-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    border: "1px solid {colors.beige-deep}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    border: "1px solid {colors.hairline-strong}"
  button-on-cream:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    border: "1px solid {colors.beige-deep}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm-medium}"
    padding: "0"
  card-base:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
  card-feature:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
  card-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.beige-deep}"
  card-cream-soft:
    backgroundColor: "{colors.surface-cream-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  card-feature-product:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
    shadow: "rgba(0, 0, 0, 0.04) 0px 4px 12px"
  card-photographic:
    backgroundColor: "{colors.surface-code}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: "0"
  role-tier-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
    note: "Used on Services page for Developer / Team Lead / Viewer roles. Renamed from Mistral's pricing-card — Hyperion's Services page communicates role capabilities, not price tiers."
  role-tier-card-featured:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "2px solid {colors.primary}"
    note: "Used for the AI Agent seat tier — the differentiating/flagship role on the Services page."
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.hairline-strong}"
    height: 44px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.primary}"
  text-area:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    border: "1px solid {colors.hairline-strong}"
  request-access-panel:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.beige-deep}"
    note: "Renamed from contact-form-panel. Hyperion's Contact page is framed as 'request workspace access / hackathon pilot signup', not generic sales contact."
  pill-tab:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.steel}"
    typography: "{typography.body-sm-medium}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
    border: "1px solid {colors.hairline}"
  pill-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.ink}"
  segmented-tab:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    typography: "{typography.body-sm-medium}"
    padding: "{spacing.sm} {spacing.md}"
    border: "0 0 2px transparent solid"
  segmented-tab-active:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm-medium}"
    border: "0 0 2px {colors.primary} solid"
  badge-orange:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-cream:
    backgroundColor: "{colors.cream-deeper}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  promo-banner:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm-medium}"
    padding: "{spacing.sm} {spacing.md}"
  hero-band-sunset:
    backgroundColor: "{colors.sunshine-700}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "{spacing.hero}"
  sunset-stripe-band:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "0"
    padding: "{spacing.lg} 0"
    note: "Signature closing element. Use in full on Product, Studio, and Coding pages. Optional/thinner variant on Services and Contact — those pages should stay task-focused and can use a slimmer stripe or omit it if it competes with form/table legibility."
  cta-banner-cream:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.section}"
  code-block:
    backgroundColor: "{colors.surface-code}"
    textColor: "{colors.on-dark}"
    typography: "{typography.code-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  code-block-header:
    backgroundColor: "{colors.surface-code}"
    textColor: "{colors.on-dark-muted}"
    typography: "{typography.caption}"
    padding: "{spacing.xs} {spacing.md}"
    border: "0 0 1px rgba(255,255,255,0.08) solid"
  feature-icon-tile:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    border: "1px solid {colors.beige-deep}"
  industry-tile:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
  stat-cell:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.stat-display}"
    padding: "{spacing.lg}"
  customer-testimonial-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
  logo-wall-item:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    typography: "{typography.body-md-medium}"
    padding: "{spacing.lg}"
  faq-accordion-item:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
    border: "0 0 1px {colors.hairline} solid"
  footer-region:
    backgroundColor: "{colors.footer-cream}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section} {spacing.xxl}"
  footer-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    padding: "{spacing.xxs} 0"
  app-store-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
---

## Scope Note (read this first)

This file governs Hyperion's **marketing/informational pages only**: Product, Le Studio, Coding Solutions, Services, Contact, News. It does NOT govern Hyperion's actual in-app product UI — the Workspace System, Terminal Multiplexer, Task Board, AI Agent Swarm, Code Editor, File Browser, Canvas Overlay, Prompt Forge, Theme Engine (40+ OKLCh themes), or Command Palette. Those get their own token system later, likely dark-mode-first and OKLCh-based, separate from this warm/cream editorial palette. Do not reskin in-app screens using these tokens.

This system is adapted from a design-analysis of Mistral AI's marketing site, for visual style reference only (gradient treatment, editorial typography voice, card geometry). Hyperion's actual page structure, layout, and copy should reflect its own product — an agentic dev workspace, not a consumer AI platform.

## Overview

The style signature: hero sections open with an elegant near-serif display face over an atmospheric sunset-gradient treatment (mustard-orange-red). Pages close with a horizontal "sunset stripe" gradient band running orange→yellow→cream just above the footer — this is the strongest brand-recognition element and should appear (in full or a thinner variant) on every marketing page.

Fraunces (near-serif, Google Fonts, free) pairs with Inter for everything else (body, headings, UI) and JetBrains Mono for code. Cream-yellow surfaces anchor form/request panels and feature cards; saturated orange carries primary CTAs. Cards use `{rounded.lg}` (12px) corners; buttons use `{rounded.md}` (8px) — sober, editorial geometry, not pill-shaped.

**Key Characteristics:**
- Atmospheric sunset-gradient hero treatment (orange-red-yellow)
- Horizontal "sunset stripe" band at page bottom (full-strength on Product/Studio/Coding, optional thin variant on Services/Contact)
- Cream-yellow surfaces for request-access panel and feature cards
- Fraunces for hero displays; Inter for everything else (PP Editorial Old as a paid upgrade path if licensed)
- `{rounded.md}` (8px) buttons, `{rounded.lg}` (12px) cards — no pill buttons except badges
- Saturated orange primary CTA confined to primary actions

## Colors

### Brand & Accent
- **Primary Orange** ({colors.primary}): Primary CTA color
- **Orange Deep** ({colors.primary-deep}): Pressed-state and emphasis variant
- **Sunshine 300/500/700/800/900**: Gradient stops for hero and stripe treatments
- **Yellow Saturated** ({colors.yellow-saturated}): Pure brand yellow in the sunset stripe
- **Block 5/6/7**: Spectrum stops along the sunset gradient

### Cream / Neutral Warm
- **Cream** ({colors.cream}): Warm surface for request-access panel, feature cards, footer
- **Cream Light** ({colors.cream-light}): Lighter cream variant
- **Cream Deeper** ({colors.cream-deeper}): More-saturated cream for badge/tag chips
- **Beige Deep** ({colors.beige-deep}): Cream surface border color

### Surface
- **Canvas** ({colors.canvas}): Page background and card surface
- **Surface Code** ({colors.surface-code}): Dark code-block / IDE mockup surface — reuse this heavily on Coding and Le Studio pages, since Hyperion's core product IS terminals/code
- **Hairline** family: 1px borders at varying strength

### Text
- **Ink** ({colors.ink}): Primary headlines and body text
- Ink-tint, charcoal, slate, steel, stone, muted: descending emphasis scale
- **On Dark** / **On Dark Muted**: white text on dark surfaces (code blocks, terminal mockups)

## Typography

### Font Family
**Fraunces** (display, default): Free near-serif via Google Fonts, similar editorial character to PP Editorial Old without licensing cost. Swap in PP Editorial Old only if you hold a license.

**Inter** (UI prose): body, navigation, buttons, labels, captions.

**JetBrains Mono** (code): code blocks and terminal/IDE mockups — this will get heavy use given Hyperion's product surface.

### Hierarchy
Same scale as before — hero-display (84px) down to micro (11px). See token block above for exact values. Stat-display (56px, Fraunces) works well for callouts like "16 tiled terminals" or "40+ themes."

## Layout

### Spacing System
Base unit 4px/8px. Section rhythm: marketing pages use `{spacing.section-lg}` (96px); Contact/Services tighten to `{spacing.section}` (64px) since those are task-focused, not atmospheric.

### Grid & Container
- 1280px max-width, 32px gutters
- Product hero: 2-column split (text left, visual right) — for Hyperion, the right side should show a workspace/terminal-grid screenshot or illustration instead of mountain photography
- Le Studio: 3-up feature grid below hero
- Contact/request-access: 1-column, cream panel centered (~520px max-width)
- Services: role-tier cards, 4-up desktop (Developer / Team Lead / AI Agent seat / Viewer)

## Elevation & Depth
Same 5-level flat-to-modal scale as the source system. Level 3 (mockup shadow) applies well to terminal/code-editor screenshots on the Product and Coding pages.

## Shapes
Same radius scale: `{rounded.md}` (8px) buttons, `{rounded.lg}` (12px) cards, `{rounded.full}` reserved for badges/pill-tabs only. No pill buttons.

## Components
See token block above for full definitions. Notable renames from the source analysis:
- `pricing-card` → `role-tier-card` (Services page communicates role capability, not price)
- `contact-form-panel` → `request-access-panel` (Contact page framed as workspace access / hackathon pilot request)
- `sunset-stripe-band` is now optional-strength on Services/Contact rather than mandatory full-strength everywhere

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for primary CTAs and active states only
- Use the sunset stripe band (full or thin) at the foot of every marketing page
- Pair Fraunces (display) with Inter (UI)
- Apply `{rounded.md}` to buttons, `{rounded.lg}` to cards
- Use cream-yellow surfaces for the request-access panel, feature cards, footer
- Lean into terminal/code screenshots (dark `surface-code` surfaces) for Product/Studio/Coding hero visuals — this is Hyperion's actual product, more credible than illustrated mountains
- Use scroll-triggered reveal animations (via the `ui-craft` skill) on Product/Coding feature sections; keep Services/Contact motion restrained for legibility

### Don't
- Don't use pill-shaped buttons
- Don't introduce accent colors beyond the orange/yellow/cream palette
- Don't apply this token system to Hyperion's in-app UI — that's a separate system
- Don't use PP Editorial Old unless licensed — default to Fraunces
- Don't drop the sunset stripe band from Product/Studio/Coding pages

## Responsive Behavior
Same breakpoint table and collapsing strategy as the source analysis (mobile <480px single column through wide desktop ≥1280px full hero). Role-tier cards: 4-column desktop → 2-column tablet → 1-column mobile, same as the original pricing-tier collapse pattern.

## Known Gaps
- Animation/transition timings not specified here — governed by the `ui-craft` skill instead
- This file does not cover Hyperion's in-app product UI (Theme Engine's 40+ OKLCh themes, terminal grid, Kanban board, Monaco editor chrome) — build that as a separate, likely dark-first, token system
- Font licensing: confirm whether you own PP Editorial Old before using it; Fraunces is the safe default
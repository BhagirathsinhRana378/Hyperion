import { ThemeProvider } from "@workspace/core/providers/theme-provider";
import { GradientBand } from "./components/gradient-band";
import { HyperionFooter } from "./components/hyperion-footer";
import { HyperionNav } from "./components/hyperion-nav";
import { ScrollProgress } from "./components/marketing-kit";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange={true}
      enableColorScheme={true}
      enableSystem={false}
      forcedTheme="dark"
    >
      <div className="landing-theme flex min-h-screen flex-col bg-background text-foreground">
        <ScrollProgress />
        <HyperionNav />
        <main className="flex-1">{children}</main>
        <GradientBand variant="full" />
        <HyperionFooter />
      </div>
    </ThemeProvider>
  );
}

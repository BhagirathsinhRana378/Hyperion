import { ThemeProvider } from "@workspace/core/providers/theme-provider";
import { HyperionNav } from "./components/hyperion-nav";
import { HyperionFooter } from "./components/hyperion-footer";
import { GradientBand } from "./components/gradient-band";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange={true}
      enableColorScheme={true}
      enableSystem={true}
    >
      <div className="flex min-h-screen flex-col">
        <HyperionNav />
        <main className="flex-1">{children}</main>
        <GradientBand variant="full" />
        <HyperionFooter />
      </div>
    </ThemeProvider>
  );
}

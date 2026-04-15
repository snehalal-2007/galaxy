import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Merged on top of cosmic nav buttons when this route is active (`NavLink` must own `className` — not `Button asChild`). */
const activeNavClass = "border-foreground/65 bg-foreground/[0.14]";

function NavCosmicLink({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(buttonVariants({ variant: "cosmic", size: "sm" }), isActive && activeNavClass)
      }
    >
      {children}
    </NavLink>
  );
}

function MobileNavLink({
  to,
  end,
  onNavigate,
  children,
}: {
  to: string;
  end?: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          buttonVariants({ variant: "cosmic", size: "default" }),
          "h-12 w-full justify-start px-4 text-left tracking-[0.18em]",
          isActive && activeNavClass
        )
      }
    >
      {children}
    </NavLink>
  );
}

/** Fixed top-left on every page except moon home (`/`). Desktop: link row. Phone: menu opens a left sheet. */
export function CosmicSiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className="fixed top-6 left-6 z-40 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="cosmic"
              size="icon"
              className="h-11 w-11 shrink-0 border-foreground/25"
              aria-label="Open site menu"
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-nav"
            >
              <Menu className="!h-5 !w-5" strokeWidth={1.75} aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(100%,18rem)] border-border/60 bg-background/95 backdrop-blur-md sm:max-w-[18rem]"
          >
            <SheetHeader className="border-b border-border/40 pb-4 text-left">
              <SheetTitle className="text-foreground text-xs font-bold uppercase tracking-[0.28em]">
                Navigate
              </SheetTitle>
            </SheetHeader>
            <nav
              id="site-mobile-nav"
              className="mt-6 flex flex-col gap-2"
              aria-label="Site navigation"
            >
              <MobileNavLink to="/" end onNavigate={closeMobile}>
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Home
                </span>
              </MobileNavLink>
              <MobileNavLink to="/about" onNavigate={closeMobile}>
                About
              </MobileNavLink>
              <MobileNavLink to="/skills" onNavigate={closeMobile}>
                Skills
              </MobileNavLink>
              <MobileNavLink to="/mission-log" onNavigate={closeMobile}>
                Experience
              </MobileNavLink>
              <MobileNavLink to="/galaxy" onNavigate={closeMobile}>
                Galaxy
              </MobileNavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <nav
        className="fixed top-6 left-6 z-40 hidden flex-wrap gap-2 md:flex"
        aria-label="Site navigation"
      >
        <NavCosmicLink to="/" end>
          <ArrowLeft className="mr-1 h-3 w-3" />
          Home
        </NavCosmicLink>
        <NavCosmicLink to="/about">About</NavCosmicLink>
        <NavCosmicLink to="/skills">Skills</NavCosmicLink>
        <NavCosmicLink to="/mission-log">Experience</NavCosmicLink>
        <NavCosmicLink to="/galaxy">Galaxy</NavCosmicLink>
      </nav>
    </>
  );
}

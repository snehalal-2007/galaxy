import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const activeNavClass =
  "border-foreground/55 bg-foreground/[0.08] shadow-[0_0_18px_hsl(var(--glow-color)/0.25)]";

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
    <Button variant="cosmic" size="sm" asChild>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) => cn(isActive && activeNavClass)}
      >
        {children}
      </NavLink>
    </Button>
  );
}

/** Fixed top-left on every page except moon home (`/`). Order: Home → About → Skills → Experience → Galaxy. */
export function CosmicSiteNav() {
  return (
    <nav
      className="fixed top-6 left-6 z-30 flex flex-wrap gap-2"
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
  );
}

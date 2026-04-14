import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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

import { ExternalLink, Award } from "lucide-react";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { certifications } from "@/data/certifications";

/** Issuer logos from src/data/*.png, matched by filename (case-insensitive). */
const logoModules = import.meta.glob("../data/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const pickLogo = (re: RegExp) => Object.entries(logoModules).find(([p]) => re.test(p))?.[1];
const ISSUER_LOGOS: Record<string, string | undefined> = {
  google: pickLogo(/google\.png$/i),
  ibm: pickLogo(/ibm\.png$/i),
};

function IssuerLogo({ issuer }: { issuer: string }) {
  const key = issuer.toLowerCase();
  const logo = key.includes("google")
    ? ISSUER_LOGOS.google
    : key.includes("ibm")
      ? ISSUER_LOGOS.ibm
      : undefined;

  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-white">
      {logo ? (
        <img src={logo} alt={`${issuer} logo`} className="h-full w-full object-contain p-1.5" loading="lazy" />
      ) : (
        <Award className="h-5 w-5 text-foreground/70" aria-hidden />
      )}
    </span>
  );
}

type CertificationsProps = { /** Render without `CosmicPageShell` for the scroll journey. */ embed?: boolean };

const Certifications = ({ embed = false }: CertificationsProps) => {
  const body = (
    <CosmicStickyTitleLayout
      documentSection={embed}
      maxWidth="5xl"
      title={
        <h1 className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow">
          CERTIFICATIONS
        </h1>
      }
    >
      {/* auto-rows-fr makes every card the same height regardless of title length. */}
      <div className="mx-auto grid max-w-4xl auto-rows-fr gap-4 md:grid-cols-2 md:gap-x-8">
        {certifications.map((c, i) => {
          const verifyUrl = c.verifyUrl?.trim();
          const interactive = !!verifyUrl;
          return (
            <Reveal
              key={c.id}
              as={interactive ? "a" : "div"}
              repeat
              delay={i * 60}
              {...(interactive
                ? { href: verifyUrl, target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={cn(
                "group flex items-start gap-3 rounded-lg border border-border/70 bg-card/45 p-4 backdrop-blur-sm transition",
                interactive && "hover:border-foreground/40 hover:bg-card/65"
              )}
              style={{ boxShadow: "0 0 20px rgba(40,55,80,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)" }}
            >
              <IssuerLogo issuer={c.issuer} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase leading-snug tracking-[0.08em] text-foreground">
                  {c.title}
                </p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {c.issuer} · {c.year}
                </p>
                {interactive ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-foreground/70 transition group-hover:text-foreground">
                    Verify credential
                    <ExternalLink className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
            </Reveal>
          );
        })}
      </div>
    </CosmicStickyTitleLayout>
  );

  if (embed) return body;
  return <CosmicPageShell>{body}</CosmicPageShell>;
};

export default Certifications;

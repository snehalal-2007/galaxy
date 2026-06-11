import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import { Reveal } from "@/components/Reveal";
import { CertificationCarousel } from "@/components/CertificationCarousel";
import { certifications } from "@/data/certifications";

type CertificationsProps = { /** Render without `CosmicPageShell` for the scroll journey. */ embed?: boolean };

const Certifications = ({ embed = false }: CertificationsProps) => {
  const body = (
    <CosmicStickyTitleLayout
      documentSection={embed}
      mainClassName="justify-center md:justify-start"
      title={
        <h1 className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow">
          CERTIFICATIONS
        </h1>
      }
    >
      <Reveal y={0}>
        <CertificationCarousel items={certifications} />
      </Reveal>
    </CosmicStickyTitleLayout>
  );

  if (embed) return body;
  return <CosmicPageShell>{body}</CosmicPageShell>;
};

export default Certifications;

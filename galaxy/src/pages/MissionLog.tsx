import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import { MissionLogTimeline, type Experience } from "@/components/MissionLogTimeline";
import experiencesData from "@/data/experiences.json";

const experiences = experiencesData.experiences as Experience[];

type MissionLogProps = { embed?: boolean };

const MissionLog = ({ embed = false }: MissionLogProps) => {
  const body = (
    <CosmicStickyTitleLayout
      documentSection={embed}
      title={
        <h1 className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow">
          MISSION LOG
        </h1>
      }
    >
      <MissionLogTimeline experiences={experiences} />
    </CosmicStickyTitleLayout>
  );

  if (embed) return body;
  return <CosmicPageShell>{body}</CosmicPageShell>;
};

export default MissionLog;

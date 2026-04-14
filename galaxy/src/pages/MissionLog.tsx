import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import { MissionLogTimeline } from "@/components/MissionLogTimeline";
import experiencesData from "@/data/experiences.json";

const experiences = experiencesData.experiences as Experience[];

const MissionLog = () => {
  return (
    <CosmicPageShell>
      <CosmicStickyTitleLayout
        title={
          <h1 className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow">
            MISSION LOG
          </h1>
        }
      >
        <MissionLogTimeline experiences={experiences} />
      </CosmicStickyTitleLayout>
    </CosmicPageShell>
  );
};

export default MissionLog;

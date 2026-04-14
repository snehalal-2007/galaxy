import { CosmicPageShell } from "@/components/CosmicPageShell";
import { MissionLogTimeline, type Experience } from "@/components/MissionLogTimeline";
import experiencesData from "@/data/experiences.json";

const experiences = experiencesData.experiences as Experience[];

const MissionLog = () => {
  return (
    <CosmicPageShell>
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-24 md:pb-20 md:pt-28">
        <h1 className="cosmic-page-title text-foreground font-bold uppercase text-glow mb-8 text-center md:mb-10">
          MISSION LOG
        </h1>

        <MissionLogTimeline experiences={experiences} />
      </div>
    </CosmicPageShell>
  );
};

export default MissionLog;

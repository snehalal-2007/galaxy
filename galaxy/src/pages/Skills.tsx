import { CosmicPageShell } from "@/components/CosmicPageShell";

const Skills = () => {
  return (
    <CosmicPageShell>
      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-24 md:pt-28 md:pb-24">
        <h1 className="cosmic-page-title text-foreground font-bold uppercase text-glow text-center mb-10 md:mb-14">
          SKILLS
        </h1>

        <main className="mx-auto max-w-3xl rounded-lg border border-border bg-card/40 p-8 backdrop-blur-sm md:p-10">
          <p className="text-center text-sm text-muted-foreground">
            Content for this page will go here when you are ready.
          </p>
        </main>
      </div>
    </CosmicPageShell>
  );
};

export default Skills;

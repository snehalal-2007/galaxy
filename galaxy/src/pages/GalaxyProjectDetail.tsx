import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { portfolioProjects } from "@/data/portfolioProjects";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import {
  ProjectDetailView,
  ProjectExternalLinks,
  type ProjectPortfolioEntry,
} from "@/components/ProjectDetailView";

const seeds = portfolioProjects;

const GalaxyProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? seeds.find((p) => p.id === projectId) : undefined;

  if (!project) {
    return <Navigate to="/galaxy" replace />;
  }

  return (
    <CosmicPageShell>
      <CosmicStickyTitleLayout
        maxWidth="6xl"
        title={
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex w-full justify-center md:justify-start">
              <Link
                to="/galaxy"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Back to galaxy
              </Link>
            </div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
              <h1
                id={`project-title-${project.id}`}
                className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow md:text-left"
              >
                {project.title}
              </h1>
              <ProjectExternalLinks project={project} />
            </div>
          </div>
        }
      >
        <ProjectDetailView project={project} />
      </CosmicStickyTitleLayout>
    </CosmicPageShell>
  );
};

export default GalaxyProjectDetail;

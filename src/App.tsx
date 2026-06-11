import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Starfield from "@/components/Starfield";
import Index from "./pages/Index.tsx";
import GalaxyProjectDetail from "./pages/GalaxyProjectDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import { PortfolioJourneyLayout } from "./components/PortfolioJourneyLayout.tsx";

const queryClient = new QueryClient();

/**
 * Single starfield behind all routes — do not add `<Starfield />` on individual pages.
 * Same wrapper on every route (drift + overscan) so the backdrop does not jump when leaving `/`.
 * New inner pages: wrap content in `<CosmicPageShell>` (`showNav={false}` only for moon home).
 */
function PersistentStarfield() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 -m-[4%] starfield-bg-drift">
      <Starfield />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PersistentStarfield />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/galaxy/project/:projectId" element={<GalaxyProjectDetail />} />
          <Route element={<PortfolioJourneyLayout />}>
            <Route path="about" element={<></>} />
            <Route path="education" element={<></>} />
            <Route path="skills" element={<></>} />
            <Route path="mission-log" element={<></>} />
            <Route path="certifications" element={<></>} />
            <Route path="galaxy" element={<></>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

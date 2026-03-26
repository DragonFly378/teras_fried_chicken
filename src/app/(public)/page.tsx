import { HeroSection } from "./home/partials/HeroSection";
import { MenuBand } from "./home/partials/MenuBand";
import { MenuHighlights } from "./home/partials/MenuHighlights";
import { AboutSection } from "./home/partials/AboutSection";
import { CtaSection } from "./home/partials/CtaSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <MenuBand />
      <MenuHighlights />
      <AboutSection />
      <CtaSection />
    </>
  );
}

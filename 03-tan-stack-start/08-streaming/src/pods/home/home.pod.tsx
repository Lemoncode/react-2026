import type { FullMainPageVm } from "./home.vm";
import type { CalendarBlockVm } from "./availability.vm";
import { Hero } from "./components/hero.component";
import { Features } from "./components/features.component";
import { Availability } from "./components/availability.component";
import { Suspense, use } from "react";

interface HomeProps {
  content: FullMainPageVm;
  availability: Promise<CalendarBlockVm[]>;
}

export const Home: React.FC<HomeProps> = ({ content, availability }) => {
  return (
    <main className="pb-8">
      <Hero hero={content.heroSection} />
      <section className="page-wrap grid gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-14">
        <Features features={content.featureSection} />
        <Suspense fallback={<div>Loading availability...</div>}>
          <Availability
            availability={content.availabilitySection}
            blocks={availability}
          />
        </Suspense>
      </section>
    </main>
  );
};

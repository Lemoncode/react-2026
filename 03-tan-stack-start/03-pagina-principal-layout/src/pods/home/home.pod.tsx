import type { FullMainPageVm } from "./home.vm";
import { Hero } from "./components/hero.component";
import { Features } from "./components/features.component";
import { Availability } from "./components/availability.component";

interface HomeProps {
  content: FullMainPageVm;
  currentMonth: string;
}

export const Home: React.FC<HomeProps> = ({ content, currentMonth }) => {
  return (
    <main className="pb-8">
      <Hero hero={content.heroSection} />
      <section className="page-wrap grid gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-14">
        <Features features={content.featureSection} />
        <Availability
          availability={content.availabilitySection}
          currentMonth={currentMonth}
        />
      </section>
    </main>
  );
};

import { MapPin, Star } from "lucide-react";
import { PhotoCarousel } from "./photo-carousel.component";
import type { HeroSection } from "../home.model";

interface HeroProps {
  hero: HeroSection;
}

export const Hero = ({ hero }: HeroProps) => {
  // El campo en Content Island se llama "description " (con espacio final).
  const description = hero["description "];

  return (
    <section className="page-wrap grid gap-10 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-14">
      <div className="rise-in space-y-7">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)] shadow-sm backdrop-blur">
          <Star className="h-4 w-4 fill-[var(--lagoon)] text-[var(--lagoon)]" />
          {hero.starText}
        </p>

        <div className="space-y-4">
          <h1 className="display-title max-w-3xl text-5xl font-semibold tracking-tight text-[var(--sea-ink)] md:text-7xl">
            {hero.title}
          </h1>
          <p className="flex items-center gap-2 text-lg text-[var(--sea-ink-soft)]">
            <MapPin className="h-5 w-5 text-[var(--lagoon-deep)]" />
            {hero.location}
          </p>
          <p className="max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
            {description}
          </p>
        </div>

        {hero.featuresSummary.length > 0 && (
          <dl className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {hero.featuresSummary.map((feature) => (
              <div key={feature.id} className="feature-card rounded-2xl p-4">
                <dd className="m-0 text-2xl font-semibold text-[var(--sea-ink)]">
                  {feature.value}
                </dd>
                <dt className="text-sm text-[var(--sea-ink-soft)]">
                  {feature.name}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="rise-in">
        <PhotoCarousel pictures={hero.Pictures} />
      </div>
    </section>
  );
};

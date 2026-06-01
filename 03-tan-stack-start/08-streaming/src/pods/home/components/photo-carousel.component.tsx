import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { Picture } from "../home.model";

interface PhotoCarouselProps {
  pictures: Picture[];
}

export const PhotoCarousel = ({ pictures }: PhotoCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (pictures.length === 0) return null;

  return (
    <div className="island-shell rounded-[2rem] p-3">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {pictures.map((picture) => (
            <CarouselItem key={picture.id}>
              <div className="relative h-[360px] overflow-hidden rounded-[1.6rem] md:h-[460px]">
                <img
                  src={picture.picture.url}
                  alt={picture.description}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 m-0 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[var(--sea-ink)] backdrop-blur">
                  {picture.description}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 size-10 border-0 bg-white/80 text-[var(--sea-ink)] hover:bg-white" />
        <CarouselNext className="right-4 size-10 border-0 bg-white/80 text-[var(--sea-ink)] hover:bg-white" />
      </Carousel>

      <div className="mt-3 flex justify-center gap-2">
        {pictures.map((picture, index) => (
          <button
            key={picture.id}
            type="button"
            aria-label={`Ir a la foto ${index + 1}`}
            aria-current={index === current}
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === current
                ? "w-8 bg-[var(--lagoon-deep)]"
                : "w-2 bg-[var(--line)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

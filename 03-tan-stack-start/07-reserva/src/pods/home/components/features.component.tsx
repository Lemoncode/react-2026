import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { featureIcons } from "../feature-icons";
import type { FeaturesSection } from "../home.model";

interface FeaturesProps {
  features: FeaturesSection;
}

export const Features = ({ features }: FeaturesProps) => (
  <Card className="island-shell gap-0 rounded-[2rem] border-0 p-0 ring-0">
    <CardContent className="space-y-6 p-7">
      <div>
        <p className="island-kicker mb-2">{features.topTitle}</p>
        <h2 className="text-3xl font-semibold text-[var(--sea-ink)]">
          {features.mainTitle}
        </h2>
      </div>

      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
        {features.features.map((feature) => {
          const Icon = featureIcons[feature.type] ?? ShieldCheck;
          return (
            <li
              key={feature.id}
              className="flex items-center gap-3 rounded-2xl bg-[var(--chip-bg)] p-4"
            >
              <span className="rounded-xl bg-[var(--sand)] p-2 text-[var(--lagoon-deep)]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-[var(--sea-ink)]">
                {feature.text}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-start gap-3 rounded-2xl bg-[var(--sand)] p-5 text-[var(--sea-ink-soft)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--lagoon-deep)]" />
        <p className="m-0 leading-7">{features.bookingInfo}</p>
      </div>
    </CardContent>
  </Card>
);

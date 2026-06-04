import { Ban, CalendarPlus, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

/**
 * Entry point for creating calendar items. The actual create flow is built
 * later (and will be a dedicated, reusable route/pod shared with the public
 * app), so for now each action just signals "coming soon".
 */
export const CalendarCreateMenu = () => {
  const { toast } = useToast();

  const comingSoon = (title: string) =>
    toast({ title, description: "Disponible próximamente." });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" className="h-9 gap-1.5 rounded-full px-4">
          <Plus className="size-4" />
          Nueva
          <ChevronDown className="size-3.5 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => comingSoon("Nueva reserva")}>
          <CalendarPlus className="size-4" />
          Nueva reserva
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => comingSoon("Bloquear fechas")}>
          <Ban className="size-4" />
          Bloquear fechas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

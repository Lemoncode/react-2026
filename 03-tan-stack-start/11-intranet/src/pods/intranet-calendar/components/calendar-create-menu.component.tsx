import { Ban, CalendarPlus, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarCreateMenuProps {
  onCreate: (type: "booking" | "block") => void;
}

/** Entry point for creating a booking or a block ("no disponible"). */
export const CalendarCreateMenu = ({ onCreate }: CalendarCreateMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button size="lg" className="h-9 gap-1.5 rounded-full px-4">
        <Plus className="size-4" />
        Nueva
        <ChevronDown className="size-3.5 opacity-80" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onSelect={() => onCreate("booking")}>
        <CalendarPlus className="size-4" />
        Nueva reserva
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onCreate("block")}>
        <Ban className="size-4" />
        Bloquear fechas
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

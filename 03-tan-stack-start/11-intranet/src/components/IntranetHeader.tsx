import { useState } from "react";
import { LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const APP_NAME = "Panel de gestión";

interface IntranetHeaderProps {
  userName: string;
}

export default function IntranetHeader({ userName }: IntranetHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: "/login" });
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        variant: "error",
        title: "No se pudo cerrar sesión",
        description: "Ha ocurrido un error. Inténtalo de nuevo en unos minutos.",
      });
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-x-3 py-3 sm:py-4">
        <span className="flex-shrink-0 text-base font-semibold tracking-tight text-[var(--sea-ink)]">
          {APP_NAME}
        </span>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--sea-ink)]">
            <UserCircle className="size-5 flex-shrink-0" aria-hidden="true" />
            <span className="hidden max-w-[12rem] truncate sm:inline">
              {userName}
            </span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isSigningOut}
            aria-label="Cerrar sesión"
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">
              {isSigningOut ? "Saliendo..." : "Cerrar sesión"}
            </span>
          </Button>
        </div>
      </nav>
    </header>
  );
}

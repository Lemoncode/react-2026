import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "error" | "success";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastOptions {
  id: number;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}

const rootClassName =
  "pointer-events-auto relative flex w-full items-start justify-between gap-3 rounded-2xl border-0 bg-[var(--card)] p-4 shadow-xl ring-1 ring-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full data-[swipe=end]:animate-out";

const variantClassName: Record<ToastVariant, string> = {
  default: "",
  error: "bg-destructive/10 ring-destructive/20",
  success: "bg-[var(--lagoon-deep)]/10 ring-[var(--lagoon-deep)]/20",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const toast = React.useCallback((options: ToastOptions) => {
    idRef.current += 1;
    setToasts((prev) => [
      ...prev,
      { id: idRef.current, variant: "default", ...options },
    ]);
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((item) => item.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}
        {toasts.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            open
            onOpenChange={(open) => {
              if (!open) remove(item.id);
            }}
            className={cn(rootClassName, variantClassName[item.variant])}
          >
            <div className="grid gap-1">
              {item.title && (
                <ToastPrimitive.Title
                  className={cn(
                    "text-base font-semibold text-[var(--sea-ink)]",
                    item.variant === "error" && "text-destructive",
                    item.variant === "success" && "text-[var(--lagoon-deep)]",
                  )}
                >
                  {item.title}
                </ToastPrimitive.Title>
              )}
              {item.description && (
                <ToastPrimitive.Description className="text-sm leading-6 text-[var(--sea-ink-soft)]">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label="Cerrar"
              className="rounded-full p-1 text-[var(--sea-ink-soft)] opacity-70 transition-opacity hover:opacity-100"
            >
              <XIcon className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-0 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 p-4 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

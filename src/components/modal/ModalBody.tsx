import { cn } from "@/lib/utils";

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)}>
      {children}
    </div>
  );
}

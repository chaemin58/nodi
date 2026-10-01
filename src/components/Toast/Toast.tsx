import { cn } from "@/lib/utils";
import CircleCheck from "@/assets/icon/circle-check.svg";
import CircleError from "@/assets/icon/circle-error.svg";
interface ToastProps {
  message: string;
  type: "success" | "error";
  isExiting?: boolean;
}

export function Toast({ message, type, isExiting = false }: ToastProps) {
  return (
    <div
      className={cn(
        "shadow-card flex gap-3 border-border-default border rounded-xl px-5 py-2 w-fit transition-all duration-200 ease-in",
        isExiting ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0",
      )}
    >
      {type === "success" ? (
        <CircleCheck className="w-5 text-primary" />
      ) : (
        //변경
        <CircleError className="w-5 text-error" />
      )}

      <div className="text-lg">{message}</div>
    </div>
  );
}

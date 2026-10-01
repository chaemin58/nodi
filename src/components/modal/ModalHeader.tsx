import { useContext } from "react";
import DeleteIcon from "@/assets/icon/icon_delete.svg";
import { cn } from "@/lib/utils";
import { ModalContext } from "./Modal";

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("ModalHeader는 Modal 안에서만 사용할 수 있습니다.");

  const { isDismissable, onClose } = ctx;

  // 무시할 수 없으면(선택 강제) header 없앰.
  if (!isDismissable) return null;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {children}
      <button type="button" onClick={onClose}>
        <DeleteIcon width={20} height={20} className="cursor-pointer" />
      </button>
    </div>
  );
}

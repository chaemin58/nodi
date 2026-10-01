// 그냥 나갈 수 있는 모달과
// 꼭 선택해야 나갈 수 있는 모달을 구분
// 그냥 나갈 수 있는 모달은 상단 x 버튼이 있고 선택해야 나갈 수 있는 모달은 상단 x 버튼이 없음.
// 선택해야 나갈 수 있다면 꼭 버튼이 필요하다.

"use client";

import { createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  isDismissable: boolean;
}

interface ModalContextValue {
  isDismissable: boolean;
  onClose: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function Modal({ children, onClose, isDismissable }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isDismissable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDismissable, onClose]);

  if (!isMounted) return null;

  const handleOverlayClick = () => {
    if (isDismissable) onClose();
  };

  return createPortal(
    <ModalContext.Provider value={{ isDismissable, onClose }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleOverlayClick}
      >
        <div
          className="modal-container flex min-w-80 flex-col gap-6 rounded-[50px] bg-white px-10 py-8"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
}

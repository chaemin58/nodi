"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getToasts, subscribeToasts, Toast as ToastType } from "./toastStore";
import { Toast } from "./Toast";

export function Toaster() {
  const [isMouted, setIsMounted] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  //마운팅되면 먼저 마운팅 되었음을 on
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setToasts(getToasts());
    const unsubscribe = subscribeToasts(() => {
      setToasts(getToasts());
    });

    return unsubscribe;
  }, []);

  if (!isMouted) return null;
  return createPortal(
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isExiting={toast.isExiting}
        />
      ))}
    </div>,
    document.body,
  );
}

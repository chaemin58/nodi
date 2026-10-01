export interface Toast {
  id: string;
  type: "success" | "error";
  message: string;
  isExiting?: boolean;
}

const TOAST_DURATION = 2500; // 화면에 떠 있는 시간
const EXIT_DURATION = 200; // 사라지는 애니메이션 재생 시간

let toasts: Toast[] = [];
let listeners: Array<() => void> = []; //실행할 setState 함수

export const showToast = {
  success: (message: string) => addToast("success", message),
  error: (message: string) => addToast("error", message),
};

const addToast = (type: "success" | "error", message: string) => {
  //일단 추가할 토스트의 랜덤하고 고유한 아이디 생성
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, type, message }];

  //새롭게 생성되었으니 notify 실행
  notify();

  // 사라지기 직전: isExiting을 켜서 퇴장 애니메이션을 재생시킴
  setTimeout(() => {
    toasts = toasts.map((toast) => (toast.id === id ? { ...toast, isExiting: true } : toast));
    notify();
  }, TOAST_DURATION - EXIT_DURATION);

  // 애니메이션이 끝난 뒤 실제로 데이터에서 제거
  setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== id);
    notify();
  }, TOAST_DURATION);
};

const notify = () => {
  //리스너즈 배열을 돌면서 실행
  listeners.forEach((listener) => listener());
};

//------------------------------------------------------------------

// Toaster가 마운트될 때 자기 setState를 listeners에 등록(구독)하는 용도.
// 되돌려주는 함수는 "구독 취소용" — Toaster가 사라질 때 실행해서 listeners에서 자신을 뺀다.
export function subscribeToasts(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// Toaster가 리렌더될 때(=notify로 깨어났을 때) "지금 최신 데이터가 뭐야?"라고 물어보는 용도.
export function getToasts(): Toast[] {
  return toasts;
}

import { create } from "zustand";
import { ReactNode } from "react";

interface Toast {
  title: string;
  description?: string;
  action?: ReactNode;
  duration?: number;
}

interface ToastStore {
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
}));

export const useToast = () => {
  const { showToast, hideToast } = useToastStore();

  return {
    toast: (options: Toast) => {
      showToast(options);
      if (options.duration !== 0) {
        setTimeout(() => {
          hideToast();
        }, options.duration || 5000);
      }
    },
    dismiss: hideToast,
  };
};

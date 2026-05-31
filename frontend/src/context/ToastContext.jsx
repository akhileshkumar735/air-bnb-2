import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = "bg-white/90 dark:bg-slate-900/90";
          let borderColor = "border-slate-200 dark:border-slate-800";
          let textColor = "text-slate-800 dark:text-slate-200";
          let Icon = Info;

          if (toast.type === "success") {
            bgColor = "bg-emerald-500/10 dark:bg-emerald-950/20";
            borderColor = "border-emerald-500/25 dark:border-emerald-500/20";
            textColor = "text-emerald-800 dark:text-emerald-400";
            Icon = CheckCircle2;
          } else if (toast.type === "error") {
            bgColor = "bg-red-500/10 dark:bg-red-955/20";
            borderColor = "border-red-500/25 dark:border-red-500/20";
            textColor = "text-red-800 dark:text-red-400";
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-2xl border ${borderColor} ${bgColor} ${textColor} backdrop-blur-md shadow-2xl pointer-events-auto transition-all duration-350 transform translate-y-0 scale-100 hover:scale-102 flex-row text-left animate-slide-in-right`}
              style={{
                animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
              }}
            >
              <div className="flex items-center space-x-3 pr-2 flex-1">
                <Icon className="h-5 w-5 shrink-0" />
                <p className="text-xs font-black tracking-normal leading-normal">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-slate-500/10 rounded-full transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Embedded style tag for slide in animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

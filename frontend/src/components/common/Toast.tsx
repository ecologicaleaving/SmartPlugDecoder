import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastNotification, ToastAction } from '../../types';

// Toast Context
interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
      persistent: toast.persistent ?? false
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast if not persistent
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// Individual Toast Component
interface ToastProps {
  toast: ToastNotification;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colorClasses = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800'
  };

  const iconColorClasses = {
    success: 'text-success-600',
    error: 'text-danger-600',
    warning: 'text-warning-600',
    info: 'text-primary-600'
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`
        relative flex items-start p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        ${colorClasses[toast.type]}
      `}
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorClasses[toast.type]}`} />

      {/* Content */}
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">
            {toast.message}
          </p>
        )}

        {/* Actions */}
        {toast.actions && toast.actions.length > 0 && (
          <div className="mt-3 flex space-x-2">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className={`
                  text-xs font-medium px-2 py-1 rounded
                  ${action.style === 'primary' 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                    : 'hover:bg-white hover:bg-opacity-10'
                  }
                  transition-colors duration-200
                `}
                onClick={() => {
                  action.action();
                  if (!toast.persistent) {
                    removeToast(toast.id);
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        className="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
        onClick={() => removeToast(toast.id)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  const success = useCallback((title: string, message?: string, actions?: ToastAction[]) => {
    addToast({ type: 'success', title, message, actions });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, actions?: ToastAction[]) => {
    addToast({ type: 'error', title, message, actions, persistent: true });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, actions?: ToastAction[]) => {
    addToast({ type: 'warning', title, message, actions });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, actions?: ToastAction[]) => {
    addToast({ type: 'info', title, message, actions });
  }, [addToast]);

  return { success, error, warning, info };
};

export default Toast;
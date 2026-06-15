import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Toast Context & Provider ──
const ToastContext = createContext(null);

let toastIdCounter = 0;

const TOAST_ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

const TOAST_DURATION = 4000;

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, TOAST_DURATION);

    return () => clearTimeout(timerRef.current);
  }, [toast.id, onRemove]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div className={`toast-item toast-${toast.type} ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon">
        <i className={`fa ${TOAST_ICONS[toast.type] || TOAST_ICONS.info}`}></i>
      </div>
      <div className="toast-content">
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        <i className="fa fa-xmark"></i>
      </button>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${TOAST_DURATION}ms` }}></div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  }, [addToast]);

  // Stabilize the toast object reference so consumers don't re-render unnecessarily
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const stableToast = useRef({
    success: (msg) => toastRef.current.success(msg),
    error: (msg) => toastRef.current.error(msg),
    warning: (msg) => toastRef.current.warning(msg),
    info: (msg) => toastRef.current.info(msg),
  }).current;

  return (
    <ToastContext.Provider value={stableToast}>
      {children}
      {createPortal(
        <div className="toast-container" aria-live="polite">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

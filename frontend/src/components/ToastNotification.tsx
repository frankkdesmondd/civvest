import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500 text-2xl" />;
      case 'error':
        return <FiAlertCircle className="text-red-500 text-2xl" />;
      case 'info':
        return <FiInfo className="text-blue-500 text-2xl" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`fixed top-24 right-6 z-100 min-w-[320px] max-w-md animate-slide-in-right shadow-2xl rounded-lg border-2 ${getBgColor()}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${getTextColor()}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`shrink-0 hover:bg-white/50 rounded-full p-1 transition ${getTextColor()}`}
        >
          <FiX className="text-lg" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-white/30 rounded-b-lg overflow-hidden">
        <div
          className={`h-full ${
            type === 'success'
              ? 'bg-green-500'
              : type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          } animate-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};

export default ToastNotification;
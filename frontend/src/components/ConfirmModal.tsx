import React, { useEffect } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import ReactDOM from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative z-10000 mx-4 max-w-md w-full animate-scale-in">
        <div className="bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`shrink-0 ${getIconColor()}`}>
                <FiAlertCircle className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-100 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 rounded-lg font-semibold text-white ${getConfirmButtonColor()} transition`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
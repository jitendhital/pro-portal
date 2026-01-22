import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Toast Notification Component
 * Displays temporary success, error, info, or warning messages
 * @param {Object} props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of toast: 'success' | 'error' | 'info' | 'warning'
 * @param {boolean} props.isVisible - Controls visibility
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {number} props.duration - Auto-close duration in ms (default: 3000)
 */
export default function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const icons = {
    success: <FaCheckCircle className="text-green-600" />,
    error: <FaExclamationCircle className="text-red-600" />,
    info: <FaInfoCircle className="text-blue-600" />,
    warning: <FaExclamationCircle className="text-yellow-600" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${typeStyles[type]} animate-slide-in-right max-w-md`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <FaTimes />
      </button>
    </div>
  );
}


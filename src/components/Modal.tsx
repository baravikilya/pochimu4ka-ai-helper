import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wideOnDesktop?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, wideOnDesktop }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-card border border-border rounded-2xl p-6 w-full mx-4 modal-shadow animate-scale-in ${wideOnDesktop ? 'max-w-[70vw] md:max-w-[70vw]' : 'max-w-md'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-smooth"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
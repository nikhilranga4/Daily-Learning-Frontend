import * as React from 'react';
import { createPortal } from 'react-dom';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children }: DialogProps) {
  if (!open) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

type DialogContentProps = {
  children: React.ReactNode;
};

export function DialogContent({ children }: DialogContentProps) {
  return <div className="space-y-4">{children}</div>;
}

type DialogHeaderProps = {
  children: React.ReactNode;
};

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="space-y-2">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end space-x-2 pt-4">{children}</div>;
}
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Continue', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
      <div className="relative overflow-hidden bg-white/95 rounded-3xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        {/* Gradient border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl" />
        
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 mb-5 border-4 border-white shadow-lg">
            <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">{title}</h3>
          
          <p className="text-slate-500 font-medium mb-8">{message}</p>
          
          <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl px-6 py-3 text-base font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 active:scale-95"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto rounded-xl bg-red-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 active:scale-95"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 
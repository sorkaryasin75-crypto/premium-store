'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface DeliveredKeysModalProps {
  isOpen: boolean;
  keys: string[];
  productTitle: string;
  onClose: () => void;
}

export const DeliveredKeysModal: React.FC<DeliveredKeysModalProps> = ({
  isOpen,
  keys,
  productTitle,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (keyText: string, index: number) => {
    navigator.clipboard.writeText(keyText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
          🎉
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100">Order Completed!</h3>
          <p className="text-xs text-slate-400 mt-0.5">{productTitle}</p>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {keys.map((keyText, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300"
            >
              <span className="truncate select-all">{keyText}</span>
              <button
                onClick={() => handleCopy(keyText, idx)}
                className="px-2.5 py-1 text-[10px] font-sans font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
              >
                {copiedIndex === idx ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};

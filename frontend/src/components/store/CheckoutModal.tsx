'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface CheckoutModalProps {
  product: any;
  userBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  userBalance,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const totalPrice = product.price * quantity;
  const hasEnoughBalance = userBalance >= totalPrice;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(quantity);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100">Confirm Purchase</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-indigo-400 font-semibold">{product.category}</p>
            <h4 className="text-sm font-bold text-slate-100">{product.title}</h4>
            <p className="text-xs text-slate-400 mt-1">Unit Price: ৳{product.price}</p>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
              >
                -
              </button>
              <span className="text-sm font-bold text-slate-100">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Price:</span>
              <span className="font-bold text-emerald-400">৳{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Your Balance:</span>
              <span className={`font-semibold ${hasEnoughBalance ? 'text-slate-200' : 'text-rose-400'}`}>
                ৳{userBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {!hasEnoughBalance && (
            <p className="text-xs text-rose-400 text-center font-medium">
              ⚠️ Insufficient balance. Please recharge your account.
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!hasEnoughBalance}
            isLoading={isSubmitting}
            onClick={handleCheckout}
          >
            Pay ৳{totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PaymentMethod {
  gateway: string;
  number: string;
  type: string;
}

interface DepositFormProps {
  paymentMethods: PaymentMethod[];
  onSubmit: (data: {
    amount: number;
    gateway: string;
    transactionId: string;
    senderNumber?: string;
  }) => Promise<void>;
}

export const DepositForm: React.FC<DepositFormProps> = ({ paymentMethods, onSubmit }) => {
  const [selectedGateway, setSelectedGateway] = useState(paymentMethods[0]?.gateway || 'BKASH');
  const [amount, setAmount] = useState<number | ''>('');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMethod = paymentMethods.find((m) => m.gateway === selectedGateway);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !transactionId.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        gateway: selectedGateway,
        transactionId: transactionId.trim(),
        senderNumber: senderNumber.trim(),
      });
      setAmount('');
      setTransactionId('');
      setSenderNumber('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
        Add Funds / Recharge Account
      </h3>

      {/* Payment Gateway Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {['BKASH', 'NAGAD', 'ROCKET'].map((gw) => (
          <button
            key={gw}
            type="button"
            onClick={() => setSelectedGateway(gw)}
            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
              selectedGateway === gw
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {gw}
          </button>
        ))}
      </div>

      {/* Selected Payment Number Box */}
      {activeMethod && (
        <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            {activeMethod.gateway} Send Money ({activeMethod.type})
          </span>
          <span className="text-base font-mono font-bold text-indigo-400 select-all">
            {activeMethod.number}
          </span>
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Deposit Amount (BDT)
          </label>
          <input
            type="number"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Transaction ID (TxnID)
          </label>
          <input
            type="text"
            placeholder="e.g. B8X9A12K3L"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Sender Mobile Number (Optional)
          </label>
          <input
            type="text"
            placeholder="017xxxxxxxx"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isSubmitting}
        >
          Submit Deposit Request
        </Button>
      </form>
    </Card>
  );
};

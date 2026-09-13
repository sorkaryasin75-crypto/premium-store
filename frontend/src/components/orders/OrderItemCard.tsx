'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OrderItemCardProps {
  order: {
    _id: string;
    items: Array<{
      productTitle: string;
      unitPrice: number;
      quantity: number;
      deliveredItems: string[];
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
  };
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({ order }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const item = order.items[0];

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">
            ID: #{order._id.slice(-6).toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <Badge variant={order.status === 'COMPLETED' ? 'success' : 'info'}>
          {order.status}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-slate-100">{item?.productTitle || 'Digital Product'}</h4>
          <p className="text-xs text-slate-400">
            Qty: {item?.quantity} × ৳{item?.unitPrice}
          </p>
        </div>
        <span className="text-sm font-extrabold text-emerald-400">
          ৳{order.totalAmount.toFixed(2)}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs flex items-center justify-center gap-1.5"
        onClick={() => setShowKeys(!showKeys)}
      >
        <span>🔑</span> {showKeys ? 'Hide Serial Keys' : 'View Delivered Keys'}
      </Button>

      {showKeys && (
        <div className="space-y-2 pt-2 border-t border-slate-800/60 animate-fade-in">
          {item?.deliveredItems?.map((keyText, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300"
            >
              <span className="truncate select-all mr-2">{keyText}</span>
              <button
                onClick={() => handleCopy(keyText, idx)}
                className="px-2 py-1 text-[10px] font-sans font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shrink-0"
              >
                {copiedIndex === idx ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

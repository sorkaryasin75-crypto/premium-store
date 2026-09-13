'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    description?: string;
    price: number;
    stockCount: number;
    category: string;
    isAvailable: boolean;
  };
  onBuyClick: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyClick }) => {
  const isOutOfStock = product.stockCount <= 0 || !product.isAvailable;

  return (
    <Card className="flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {product.category}
          </span>
          <Badge variant={isOutOfStock ? 'danger' : 'success'}>
            {isOutOfStock ? 'Out of Stock' : `${product.stockCount} in stock`}
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 line-clamp-1">{product.title}</h3>
        {product.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-medium">Price</span>
          <span className="text-base font-extrabold text-emerald-400">৳{product.price.toFixed(2)}</span>
        </div>

        <Button
          size="sm"
          variant={isOutOfStock ? 'outline' : 'primary'}
          disabled={isOutOfStock}
          onClick={() => onBuyClick(product)}
        >
          {isOutOfStock ? 'Sold Out' : 'Buy Now'}
        </Button>
      </div>
    </Card>
  );
};

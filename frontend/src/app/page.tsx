'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { CheckoutModal } from '@/components/store/CheckoutModal';
import { DeliveredKeysModal } from '@/components/store/DeliveredKeysModal';
import { apiClient } from '@/services/api';

export default function StorefrontPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [deliveredKeys, setDeliveredKeys] = useState<string[]>([]);
  const [deliveredTitle, setDeliveredTitle] = useState('');
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchUserData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/api/products');
      if (res.data?.success) {
        setProducts(res.data.data);
        const cats = Array.from(new Set(res.data.data.map((p: any) => p.category))) as string[];
        setCategories(cats);
      }
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await apiClient.get('/api/auth/me');
      if (res.data?.success) {
        setUserBalance(res.data.data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleOpenBuy = (product: any) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleConfirmPurchase = async (quantity: number) => {
    if (!selectedProduct) return;

    try {
      const res = await apiClient.post('/api/orders/checkout', {
        productId: selectedProduct._id,
        quantity,
      });

      if (res.data?.success) {
        setIsCheckoutOpen(false);
        setDeliveredKeys(res.data.data.deliveredData);
        setDeliveredTitle(selectedProduct.title);
        setIsKeysModalOpen(true);

        // Refresh Data
        fetchProducts();
        fetchUserData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete order');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout userBalance={userBalance}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search premium products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onBuyClick={handleOpenBuy} />
            ))
          ) : (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-medium text-slate-400 mt-2">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        product={selectedProduct}
        userBalance={userBalance}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmPurchase}
      />

      {/* Delivered Keys Dialog */}
      <DeliveredKeysModal
        isOpen={isKeysModalOpen}
        keys={deliveredKeys}
        productTitle={deliveredTitle}
        onClose={() => setIsKeysModalOpen(false)}
      />
    </AppLayout>
  );
}

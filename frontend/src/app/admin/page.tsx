'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/services/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'DEPOSITS' | 'PRODUCTS' | 'INVENTORY'>('DEPOSITS');
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form States for Product Creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');

  // Form States for Inventory Upload
  const [selectedProductId, setSelectedProductId] = useState('');
  const [rawKeys, setRawKeys] = useState('');

  useEffect(() => {
    fetchPendingDeposits();
    fetchProducts();
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      const res = await apiClient.get('/api/admin/deposits/pending');
      if (res.data?.success) setPendingDeposits(res.data.data);
    } catch (err) {
      console.error('Failed to load pending deposits:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/api/products');
      if (res.data?.success) setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleApproveDeposit = async (depositId: string) => {
    try {
      const res = await apiClient.post(`/api/admin/deposits/${depositId}/approve`);
      if (res.data?.success) {
        alert('Deposit approved successfully!');
        fetchPendingDeposits();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const res = await apiClient.post(`/api/admin/deposits/${depositId}/reject`, { reason });
      if (res.data?.success) {
        alert('Deposit rejected!');
        fetchPendingDeposits();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject deposit');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) return;

    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/admin/products', {
        title,
        description,
        price: Number(price),
        category,
      });

      if (res.data?.success) {
        alert('Product created successfully!');
        setTitle('');
        setDescription('');
        setPrice('');
        setCategory('');
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !rawKeys.trim()) return;

    const items = rawKeys.split('\n').filter((k) => k.trim() !== '');

    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/admin/inventory/import', {
        productId: selectedProductId,
        items,
      });

      if (res.data?.success) {
        alert(`Successfully imported ${res.data.data.count} serial keys (Encrypted via AES-256)!`);
        setRawKeys('');
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to import serial keys');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('DEPOSITS')}
            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'DEPOSITS'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Deposits ({pendingDeposits.length})
          </button>
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Create Product
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'INVENTORY'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Import Keys
          </button>
        </div>

        {/* TAB 1: PENDING DEPOSITS AUDIT */}
        {activeTab === 'DEPOSITS' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100">Pending Manual Deposits</h3>
            {pendingDeposits.length > 0 ? (
              pendingDeposits.map((dep) => (
                <Card key={dep._id} className="space-y-2">
                  <div className="flex justify-between items-start border-b border-slate-800/80 pb-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-400">{dep.gateway}</span>
                      <p className="text-xs font-mono text-slate-200 mt-0.5">TxnID: {dep.transactionId}</p>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400">৳{dep.amount}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Sender: {dep.senderNumber || 'N/A'}</span>
                    <span>Telegram ID: {dep.telegramId}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleApproveDeposit(dep._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleRejectDeposit(dep._id)}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No pending deposit requests</p>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'PRODUCTS' && (
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
              Add New Digital Product
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix Premium 1 Month"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Streaming, Subscriptions, Keys"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Price (BDT)</label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Product details and warranty info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Create Product
              </Button>
            </form>
          </Card>
        )}

        {/* TAB 3: INVENTORY BULK IMPORT */}
        {activeTab === 'INVENTORY' && (
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
              Bulk Import Encrypted Serial Keys
            </h3>
            <form onSubmit={handleImportKeys} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Select Target Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.stockCount} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Serial Keys / Accounts (One item per line)
                </label>
                <textarea
                  placeholder="user1:pass1&#10;user2:pass2&#10;KEY-XXXX-YYYY-ZZZZ"
                  value={rawKeys}
                  onChange={(e) => setRawKeys(e.target.value)}
                  rows={6}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                Encrypt & Save Keys
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

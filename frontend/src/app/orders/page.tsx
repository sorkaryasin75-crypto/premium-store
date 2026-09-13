'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { apiClient } from '@/services/api';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchUserBalance();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/api/orders/my-orders');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const res = await apiClient.get('/api/auth/me');
      if (res.data?.success) {
        setUserBalance(res.data.data.balance || 0);
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  };

  return (
    <AppLayout userBalance={userBalance}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">My Orders & Keys Vault</h2>
          <span className="text-xs text-slate-400 font-medium">{orders.length} Orders</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading your vault...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderItemCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/50">
            <span className="text-3xl">📦</span>
            <p className="text-sm font-medium text-slate-400 mt-2">No purchase history yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

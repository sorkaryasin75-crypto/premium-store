'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DepositForm } from '@/components/deposit/DepositForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/services/api';

export default function DepositPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [userDeposits, setUserDeposits] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchPaymentMethods();
    fetchUserDeposits();
    fetchUserBalance();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const res = await apiClient.get('/api/deposits/payment-methods');
      if (res.data?.success) {
        setPaymentMethods(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    }
  };

  const fetchUserDeposits = async () => {
    try {
      const res = await apiClient.get('/api/deposits/my-deposits');
      if (res.data?.success) {
        setUserDeposits(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load deposits:', err);
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

  const handleDepositSubmit = async (data: any) => {
    try {
      const res = await apiClient.post('/api/deposits/request', data);
      if (res.data?.success) {
        alert('Deposit request submitted! Admin will verify soon.');
        fetchUserDeposits();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit deposit request');
    }
  };

  return (
    <AppLayout userBalance={userBalance}>
      <div className="space-y-4">
        <DepositForm paymentMethods={paymentMethods} onSubmit={handleDepositSubmit} />

        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-100">Deposit History</h3>
          {userDeposits.length > 0 ? (
            userDeposits.map((dep) => (
              <Card key={dep._id} className="flex justify-between items-center py-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{dep.gateway}</span>
                    <span className="text-[10px] font-mono text-indigo-400">{dep.transactionId}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(dep.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">
                    ৳{dep.amount.toFixed(2)}
                  </span>
                  <Badge
                    variant={
                      dep.status === 'APPROVED'
                        ? 'success'
                        : dep.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {dep.status}
                  </Badge>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No recent deposits found</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import React from 'react';
import { Header } from './Header';
import { Navbar } from './Navbar';

export const AppLayout: React.FC<{ children: React.ReactNode; userBalance?: number }> = ({
  children,
  userBalance = 0,
}) => {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header userBalance={userBalance} />
      <main className="flex-1 max-w-md w-full mx-auto p-4">{children}</main>
      <Navbar />
    </div>
  );
};

'use client';

import React from 'react';
import { useTelegramTheme } from '../providers/TelegramThemeProvider';

export const Header: React.FC<{ userBalance?: number }> = ({ userBalance = 0 }) => {
  const { tgUser } = useTelegramTheme();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/20">
          {tgUser?.first_name ? tgUser.first_name[0] : 'U'}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100 leading-tight">
            {tgUser?.first_name ? `${tgUser.first_name}` : 'Premium Store'}
          </h2>
          <p className="text-xs text-slate-400">@{tgUser?.username || 'digital_store'}</p>
        </div>
      </div>

      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
        <span className="text-xs font-medium text-slate-400 mr-1.5">Balance:</span>
        <span className="text-sm font-bold text-emerald-400">৳{userBalance.toFixed(2)}</span>
      </div>
    </header>
  );
};

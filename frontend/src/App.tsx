import React, { useEffect, useState } from 'react';
import { ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [initData, setInitData] = useState<string>('');

  useEffect(() => {
    // Notify Telegram WebApp that application is ready to render
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      setInitData(window.Telegram.WebApp.initData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Premium Digital Store
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Production-Ready Telegram WebApp Client
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-slate-300">Ultra-Fast Engine</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-300">HMAC Authentication</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 truncate bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          InitData State: {initData ? "Loaded from Telegram" : "Running in standalone browser"}
        </div>
      </div>
    </div>
  );
}

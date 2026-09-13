import React from 'react';
import { LayoutDashboard, Users, ShoppingCart, Key, Settings } from 'lucide-react';

export default function App() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Admin Sidebar Scaffolding */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 px-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 font-medium">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
              <Users className="w-5 h-5" />
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
              <ShoppingCart className="w-5 h-5" />
              <span>Orders</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
              <Key className="w-5 h-5" />
              <span>Inventory</span>
            </a>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Admin View Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Operational Dashboard</h1>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
            Admin Panel Scaffolding Ready. Production RBAC & Management Modules will be connected in Phase 12 & 14.
          </div>
        </div>
      </main>
    </div>
  );
}

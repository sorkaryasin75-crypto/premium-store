'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramThemeContextType {
  colorScheme: 'light' | 'dark';
  isTelegram: boolean;
  tgUser: any | null;
}

const TelegramThemeContext = createContext<TelegramThemeContextType>({
  colorScheme: 'dark',
  isTelegram: false,
  tgUser: null,
});

export const useTelegramTheme = () => useContext(TelegramThemeContext);

export function TelegramThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [isTelegram, setIsTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();

      setIsTelegram(true);
      setTgUser(tg.initDataUnsafe?.user || null);

      if (tg.colorScheme) {
        setColorScheme(tg.colorScheme);
        document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
      }

      tg.onEvent('themeChanged', () => {
        if (tg.colorScheme) {
          setColorScheme(tg.colorScheme);
          document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
        }
      });
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <TelegramThemeContext.Provider value={{ colorScheme, isTelegram, tgUser }}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </div>
    </TelegramThemeContext.Provider>
  );
}

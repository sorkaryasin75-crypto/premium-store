import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TelegramThemeProvider } from '@/components/providers/TelegramThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Premium Digital Store',
  description: 'Instant Auto-Delivery Digital Products Store Mini App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className={inter.className}>
        <TelegramThemeProvider>{children}</TelegramThemeProvider>
      </body>
    </html>
  );
}

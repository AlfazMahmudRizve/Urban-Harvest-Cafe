import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-lato' });

export const metadata: Metadata = {
  title: 'Urban Harvest Cafe',
  description: 'Artisan Eats. Locally Sourced. Served with Love.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

import OrderReadyToast from "@/components/notification/OrderReadyToast";

import { getCustomerSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCustomerSession();

  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans bg-cream text-espresso`}>
        {children}
        <OrderReadyToast customerId={session?.id} />

        {/* Decorative gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-latte to-transparent" />

        <footer className="bg-espresso-deep py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="font-heading font-bold text-2xl text-cream tracking-wide">
              Urban Harvest Cafe
            </p>
            <p className="text-cream/50 text-sm mt-2 font-sans">&copy; {new Date().getFullYear()} &mdash; Artisan Eats. Locally Sourced.</p>

            <div className="flex justify-center gap-6 mt-5 text-sm text-cream/70 font-sans">
              <a href="tel:+8801234567890" className="hover:text-latte transition-colors duration-300 cursor-pointer">+880 1234-567890</a>
              <span className="text-cream/30">|</span>
              <a href="mailto:urbanharvest.cafe@gmail.com" className="hover:text-latte transition-colors duration-300 cursor-pointer">urbanharvest.cafe@gmail.com</a>
            </div>

            <div className="w-16 h-px bg-gradient-to-r from-transparent via-latte/40 to-transparent mx-auto mt-6 mb-4" />

            <p className="text-xs text-cream/40 font-sans">
              Designed & Developed by{' '}
              <a href="https://whoisalfaz.me" target="_blank" className="text-latte/70 font-bold hover:text-latte transition-colors duration-300 cursor-pointer">
                Alfaz Mahmud Rizve
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

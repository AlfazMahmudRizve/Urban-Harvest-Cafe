import { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import PitchViewer from '@/components/pitch/PitchViewer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Urban Harvest Cafe - One-Man Cafe SaaS & Ordering System Showcase',
  description: 'An interactive, high-aesthetic presentation of Urban Harvest Cafe: a zero-friction ordering and real-time off-browser notification system designed specifically for solo cafe operators.',
  keywords: 'SaaS for solo cafes, Telegram ordering bot, Next.js cafe POS, zero-commission order system, Web Push notification cafe, solo entrepreneur POS, coffee shop SaaS',
  openGraph: {
    title: 'Urban Harvest Cafe - One-Man Cafe SaaS Showcase',
    description: 'Explore the tech stack, features, and business value of the ultimate solo cafe operator digital co-pilot.',
    url: 'https://urbancafe.whoisalfaz.me/showcase',
    type: 'website',
  }
};

export default function PitchPage() {
  return (
    <main className={`${jakarta.variable} ${outfit.variable} min-h-screen bg-[#1A1412] text-[#FCFAF6] antialiased overflow-hidden`}>
      {/* Dynamic font styling utility overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-outfit {
          font-family: var(--font-outfit), sans-serif !important;
        }
        .font-jakarta {
          font-family: var(--font-jakarta), sans-serif !important;
        }
      ` }} />

      {/* JSON-LD Structured Data for Search Engine Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Urban Harvest Cafe SaaS",
            "operatingSystem": "All",
            "applicationCategory": "BusinessApplication",
            "description": "A serverless, real-time ordering and off-browser multi-channel notification engine for solo cafe operators.",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Person",
              "name": "Alfaz Mahmud Rizve"
            }
          })
        }}
      />
      
      <PitchViewer />
    </main>
  );
}

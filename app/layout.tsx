import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Om Manoj Pophale — Reports & Publications',
  description:
    'A curated personal archive of research reports, strategy journals, case studies, and industry analysis by Om Manoj Pophale.',
  keywords: ['Om Manoj Pophale', 'reports', 'publications', 'research', 'analysis'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t-4 border-black mt-24">
          <div className="page-container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-mono font-bold text-sm uppercase tracking-widest">
              OM MANOJ POPHALE &copy; {new Date().getFullYear()}
            </span>
            <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
              ALL RIGHTS RESERVED
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

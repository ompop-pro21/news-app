import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'DocPress — Serverless Document Publishing',
  description:
    'A blazing-fast, distraction-free publishing platform powered by Google Drive and Next.js static site generation.',
  keywords: ['publishing', 'documents', 'serverless', 'static', 'google drive'],
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
              DOCPRESS &copy; {new Date().getFullYear()}
            </span>
            <span className="font-mono text-xs text-gray-500 uppercase tracking-wider">
              POWERED BY GOOGLE DRIVE · NEXT.JS · FIREBASE HOSTING
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

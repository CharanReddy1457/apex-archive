import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import CyberDock from '@/components/CyberDock';

export const metadata: Metadata = {
  title: 'Apex Archive — University Previous Papers & Course Repository',
  description: 'Premium academic repository for college students to organize, search, view, and compare previous-year question papers, syllabus, and dynamic evaluation patterns.',
  keywords: ['previous year question papers', 'CT-1', 'CT-2', 'Final Assessment', 'DBMS', 'Operating Systems', 'Computer Networks', 'assessment patterns', 'syllabus'],
  openGraph: {
    title: 'Apex Archive — University Previous Papers & Course Repository',
    description: 'Find previous question papers for your subject, professor, academic year, and assessment pattern.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-light-bg dark:bg-cyber-bg text-light-text dark:text-slate-100 flex flex-col antialiased selection:bg-cyber-blue selection:text-white pb-24">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <CyberDock />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react';
import { FocusModeProvider } from '@/components/app/focus-mode';

export const metadata: Metadata = {
  title: 'Karma',
  description: 'A structured goal and task breakdown app for learning and project planning.',
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FocusModeProvider>
            {children}
            <Toaster />
        </FocusModeProvider>
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <RootLayoutContent>{children}</RootLayoutContent>
    </Suspense>
  )
}

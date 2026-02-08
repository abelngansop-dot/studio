import type { Metadata } from 'next';
import './globals.css';
import { ToastStateProvider, Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/provider';
import { LanguageProvider } from '@/context/language-context';
import { HtmlLangUpdater } from '@/components/HtmlLangUpdater';
import { SwipeNavigationHandler } from '@/components/SwipeNavigationHandler';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'Inoublevents',
  description: 'Organisez votre événement en toute tranquillité, choisissez, on vous rappelle.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider>
          <ToastStateProvider>
            <FirebaseErrorListener />
            <LanguageProvider>
              <HtmlLangUpdater />
              <SwipeNavigationHandler />
              {children}
              <Toaster />
            </LanguageProvider>
          </ToastStateProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}

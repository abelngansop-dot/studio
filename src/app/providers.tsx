'use client';

import { ToastStateProvider, Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/provider';
import { LanguageProvider } from '@/context/language-context';
import { HtmlLangUpdater } from '@/components/HtmlLangUpdater';
import { SwipeNavigationHandler } from '@/components/SwipeNavigationHandler';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

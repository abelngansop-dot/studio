'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It displays a user-friendly toast notification instead of throwing an exception,
 * preventing the application from crashing.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log the full error for developers in the console
      console.error("Caught Firestore Permission Error:", error);
      
      // Show a non-crashing, user-friendly toast notification
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations nécessaires pour effectuer cette action.",
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // This component renders nothing.
  return null;
}

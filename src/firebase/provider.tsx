'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';

import { firebaseConfig } from '@/firebase/config';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, LayoutGrid, User as UserIcon, PanelLeft, ShoppingCart, Package, ImageIcon, Settings, Heart, Phone, LogIn } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';


// --- START BOTTOM NAV BAR ---
type UserProfile = {
  role: 'client' | 'shop_admin' | 'admin' | 'superadmin';
  shopId?: string;
};


type BottomNavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

const BottomNavItem = ({ href, icon, label }: BottomNavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={cn(
      "flex flex-col items-center justify-center gap-1 w-full h-full p-2 transition-colors",
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
    )}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

const BottomNavBar = () => {
    const { user, firestore } = useContext(FirebaseContext)!;
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        // Hide nav bar on admin login page or legal page on mobile
        if (pathname === '/admin' || pathname === '/legal' || pathname === '/login') {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
    }, [pathname]);

    if (!isVisible) return null;
    
    let navItems: BottomNavItemProps[] = [];

    if (userProfile?.role === 'shop_admin') {
        navItems = [
            { href: '/dashboard', icon: <Home size={22}/>, label: 'Dashboard' },
            { href: '/dashboard/bookings', icon: <ShoppingCart size={22}/>, label: 'Réservations' },
            { href: '/dashboard/services', icon: <Package size={22}/>, label: 'Services' },
            { href: '/dashboard/gallery', icon: <ImageIcon size={22}/>, label: 'Galerie' },
            { href: '/dashboard/settings', icon: <Settings size={22}/>, label: 'Paramètres' },
        ];
    } else if (user) { // Regular authenticated user
        navItems = [
            { href: '/', icon: <Home size={22}/>, label: 'Accueil' },
            { href: '/mes-reservations', icon: <LayoutGrid size={22}/>, label: 'Réservations' },
            { href: '/profil', icon: <UserIcon size={22}/>, label: 'Profil' },
        ];
    } else { // Unauthenticated user
        navItems = [
            { href: '/', icon: <Home size={22}/>, label: 'Accueil' },
            { href: '/#reviews', icon: <Heart size={22}/>, label: 'Avis' },
            { href: '/#contact', icon: <Phone size={22}/>, label: 'Contact' },
            { href: '/login', icon: <LogIn size={22}/>, label: 'Connexion' },
        ];
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-border z-50">
            <div className="flex items-center justify-around h-full">
                {navItems.map(item => <BottomNavItem key={item.href} {...item} />)}
            </div>
        </div>
    );
};
// --- END BOTTOM NAV BAR ---


interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const firebaseServices = useMemo(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app)
    };
  }, []);

  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      setUserAuthState({ user, isUserLoading: false, userError: null });
    }, (error) => {
      console.error("FirebaseProvider: onAuthStateChanged error:", error);
      setUserAuthState({ user: null, isUserLoading: false, userError: error });
    });
    return () => unsubscribe();
  }, [firebaseServices.auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseServices.firebaseApp && firebaseServices.firestore && firebaseServices.auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseServices.firebaseApp : null,
      firestore: servicesAvailable ? firebaseServices.firestore : null,
      auth: servicesAvailable ? firebaseServices.auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseServices, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
      <BottomNavBar />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

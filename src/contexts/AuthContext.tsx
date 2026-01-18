// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 500);

    const initAuth = async () => {
      try {
        // Try to load from cache first for instant UI
        const cachedUser = localStorage.getItem('mitcare_cached_user');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            if (mounted) {
              setUser(userData);
              setLoading(false);
            }
          } catch (e) {
            localStorage.removeItem('mitcare_cached_user');
          }
        }
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (mounted) setLoading(false);
          clearTimeout(timeout);
          return;
        }

        // Early exit if no session
        if (!session?.user) {
          localStorage.removeItem('mitcare_cached_user');
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          clearTimeout(timeout);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          localStorage.removeItem('mitcare_cached_user');
          if (mounted) setLoading(false);
          clearTimeout(timeout);
          return;
        }

        const userData: User = {
          id: data.id,
          email: data.email,
          role: data.role,
          full_name: data.full_name,
          language: data.language,
          created_at: data.created_at,
        };

        if (mounted) {
          setUser(userData);
          setLoading(false);
          localStorage.setItem('mitcare_cached_user', JSON.stringify(userData));
        }
        
        clearTimeout(timeout);
      } catch (error) {
        if (mounted) setLoading(false);
        clearTimeout(timeout);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data && mounted) {
          const userData: User = {
            id: data.id,
            email: data.email,
            role: data.role,
            full_name: data.full_name,
            language: data.language,
            created_at: data.created_at,
          };
          setUser(userData);
          setLoading(false);
          localStorage.setItem('mitcare_cached_user', JSON.stringify(userData));
        }
      } else {
        if (mounted) {
          setUser(null);
          setLoading(false);
          localStorage.removeItem('mitcare_cached_user');
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (role: UserRole) => {
    localStorage.setItem('pending_role', role);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    localStorage.removeItem('mitcare_cached_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
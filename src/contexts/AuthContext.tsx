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
    
    // SAFETY: Force loading to false after 5 seconds no matter what
    const timeout = setTimeout(() => {
      console.log('⏰ TIMEOUT: Forcing loading to false');
      if (mounted) setLoading(false);
    }, 5000);

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (mounted) setLoading(false);
          clearTimeout(timeout);
          return;
        }

        if (session?.user) {
          console.log('👤 Session found for:', session.user.email);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.log('⚠️ No profile found:', error.message);
            if (mounted) setLoading(false);
            clearTimeout(timeout);
            return;
          }

          console.log('✅ Profile loaded:', data.email, 'Role:', data.role);
          
          if (mounted) {
            setUser({
              id: data.id,
              email: data.email,
              role: data.role,
              full_name: data.full_name,
              language: data.language,
              created_at: data.created_at,
            });
            setLoading(false);
          }
        } else {
          console.log('🚫 No session found');
          if (mounted) setLoading(false);
        }
        
        clearTimeout(timeout);
      } catch (error) {
        console.error('💥 Init auth error:', error);
        if (mounted) setLoading(false);
        clearTimeout(timeout);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data && mounted) {
          setUser({
            id: data.id,
            email: data.email,
            role: data.role,
            full_name: data.full_name,
            language: data.language,
            created_at: data.created_at,
          });
          setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setLoading(false);
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
  };

  console.log('🎯 AuthContext render - Loading:', loading, 'User:', user?.email || 'none');

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
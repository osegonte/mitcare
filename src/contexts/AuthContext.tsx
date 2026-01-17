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

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Check active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('👤 Session found, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('🚫 No session found');
          if (mounted) setLoading(false);
        }
      } catch (error) {
        console.error('💥 Init auth error:', error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('📥 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('⚠️ No profile found:', error.message);
        setLoading(false);
        return;
      }

      console.log('✅ Profile loaded:', data.email);
      
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
        language: data.language,
        created_at: data.created_at,
      });
      setLoading(false);
    } catch (error) {
      console.error('💥 Error fetching profile:', error);
      setLoading(false);
    }
  };

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

  console.log('🎯 AuthContext state - Loading:', loading, 'User:', user?.email || 'none');

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
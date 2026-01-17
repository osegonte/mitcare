import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export async function handleAuthCallback() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    // Profile exists, user is already set up
    return profile.role;
  }

  // New user - get role from localStorage
  const pendingRole = localStorage.getItem('pending_role') as UserRole;
  localStorage.removeItem('pending_role');

  if (!pendingRole) {
    throw new Error('No role specified');
  }

  // Create profile
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email!,
    role: pendingRole,
    full_name: user.user_metadata.full_name || user.user_metadata.name,
    language: 'de',
  });

  if (error) throw error;

  return pendingRole;
}
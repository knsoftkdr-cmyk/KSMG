import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase.js';

const AuthCtx = createContext({ user: null, role: null, loading: true });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, role: null, loading: true });

  useEffect(() => {
    let alive = true;
    const load = async session => {
      const user = session?.user ?? null;
      let role = null;
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        role = data?.role ?? 'customer';
      }
      if (alive) setState({ user, role, loading: false });
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => load(session), 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const value = {
    ...state,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, fullName) => supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } },
    }),
    signOut: () => supabase.auth.signOut(),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
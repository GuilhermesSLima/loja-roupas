import { useState, useEffect } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('loja_id')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (isMounted) {
          setLojaId(data?.loja_id || null);
        }
      } catch (err) {
        console.error('Erro ao buscar perfil do administrador:', err);
        if (isMounted) {
          setLojaId(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        if (newSession?.user) {
          setLoading(true);
          fetchProfile(newSession.user.id);
        } else {
          setLojaId(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, lojaId, loading, signOut };
}

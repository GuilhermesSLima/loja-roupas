import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, lojaId, loading } = useAuth();

  // While checking auth state, show a minimal loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-gray-light border-t-primary rounded-full animate-spin" />
          <p className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
            Verificando acesso...
          </p>
        </div>
      </div>
    );
  }

  // If no session or no lojaId associated, redirect to login
  if (!session || !lojaId) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated – render the protected content
  return <>{children}</>;
};

import React from 'react';
import Link from 'next/link';
import { Navigate, useLocation } from '@/lib/router-compat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4">
        <Card className="bg-surface-container-low border border-outline-variant/30 rounded-3xl shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 border border-primary/25 text-primary rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the intended destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4">
        <Card className="bg-surface-container-low border border-destructive/30 max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold text-on-surface">Administrator Access Required</h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Signed in as <span className="font-mono text-on-surface font-medium">{user.email}</span>. This account does not possess administrator claims (<code className="text-xs bg-surface-container px-1 py-0.5 rounded">app_metadata.role !== &apos;admin&apos;</code>).
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

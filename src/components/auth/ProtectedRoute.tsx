import React from 'react';
import { Navigate, useLocation, useNavigate } from '@/lib/router-compat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ShieldAlert, LogOut, Home } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="bg-card/50 backdrop-blur-md border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#090c13]" />
            </div>
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with the intended destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Verify server-trusted app_metadata role claim
  const isAdmin = user.app_metadata?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="bg-card/50 backdrop-blur-md border-destructive/30 max-w-md w-full shadow-glow">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Access Denied</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account (<span className="font-mono text-xs text-foreground/90">{user.email}</span>) does not have administrator privileges required to access the admin portal.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4" />
                Return Home
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={async () => {
                  await signOut();
                  navigate('/admin/login');
                }}
              >
                <LogOut className="w-4 h-4" />
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

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNavigate } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error);
        toast.error(error);
      } else {
        toast.success('Welcome back!');
        navigate('/admin');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-surface-container-low border border-outline-variant/30 rounded-3xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center text-primary">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display font-bold text-on-surface tracking-tight">
                Admin Login
              </CardTitle>
              <CardDescription className="text-on-surface-variant mt-2">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-on-surface">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3 top-3.5 h-5 w-5 text-on-surface-variant" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    enterKeyHint="next"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-surface-container border-outline-variant/40 text-on-surface placeholder:text-outline focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-on-surface">
                  Password
                </Label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-3.5 h-5 w-5 text-on-surface-variant" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    enterKeyHint="done"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-surface-container border-outline-variant/40 text-on-surface placeholder:text-outline focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-transparent text-on-surface-variant hover:text-on-surface"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-on-surface text-surface hover:opacity-90 rounded-full font-semibold transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-surface/20 border-t-surface rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button asChild variant="ghost" className="text-on-surface-variant hover:text-primary">
                <Link href="/">
                  ← Back to Portfolio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;

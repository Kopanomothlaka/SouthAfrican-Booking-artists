import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Mail, Lock } from 'lucide-react';

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // First check if user is a client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('full_name')
          .eq('id', data.user.id)
          .single();

        if (!clientError && clientData) {
          // User is a client
          navigate('/client-dashboard');
          toast({
            title: "Welcome back!",
            description: "You can now book amazing artists from your dashboard.",
          });
        } else {
          // Check if user is in users table (for admin/artist)
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (userData?.role === 'admin') {
            navigate('/admin');
            toast({
              title: "Welcome back!",
              description: "You have been logged in as an admin.",
            });
          } else {
            // Check if user is an artist
            const { data: artistData } = await supabase
              .from('artists')
              .select('status')
              .eq('id', data.user.id)
              .single();

            if (artistData) {
              if (artistData.status === 'approved') {
                navigate('/artist/dashboard');
                toast({
                  title: "Welcome back!",
                  description: "You have been logged in to your artist dashboard.",
                });
              } else {
                navigate('/pending-approval');
                toast({
                  title: "Account pending approval",
                  description: "Your artist account is still being reviewed.",
                });
              }
            } else {
              // Default redirect for users without role
              navigate('/artists');
              toast({
                title: "Welcome back!",
                description: "You have been logged in successfully.",
              });
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-16">
        <div className="container max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">
              Login
            </h1>
            <p className="text-foreground/70">
              Access your account to book amazing artists
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/client-register" className="text-primary hover:underline">
                      Sign up as a client
                    </Link>
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="text-center text-sm text-foreground/70">
                  Are you an artist?{' '}
                  <Link to="/join-as-artist" className="text-primary hover:underline">
                    Join as an Artist
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserLogin;

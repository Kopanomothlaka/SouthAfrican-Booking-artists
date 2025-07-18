import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const ArtistLogin = () => {
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
      // Step 1: Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Step 2: Check if user has artist role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        await supabase.auth.signOut();
        toast({
          title: "Login error",
          description: "Could not verify user role",
          variant: "destructive",
        });
        return;
      }

      if (userData.role !== 'artist') {
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "This account is not registered as an artist.",
          variant: "destructive",
        });
        return;
      }

      // Step 3: Check artist approval status
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('status')
        .eq('id', data.user.id)
        .single();

      if (artistError) {
        console.error('Error fetching artist status:', artistError);
        await supabase.auth.signOut();
        toast({
          title: "Login error",
          description: "Could not verify artist status",
          variant: "destructive",
        });
        return;
      }

      // Step 4: Redirect based on status
      if (artistData.status === 'approved') {
        toast({
          title: "Login successful",
          description: "Welcome to your artist dashboard!",
        });
        navigate('/artist/dashboard');
      } else if (artistData.status === 'pending') {
        toast({
          title: "Application pending",
          description: "Your application is still under review.",
        });
        navigate('/pending-approval');
      } else if (artistData.status === 'rejected') {
        await supabase.auth.signOut();
        toast({
          title: "Application rejected",
          description: "Your artist application has been rejected.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive",
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
            <h1 className="text-4xl font-display font-bold mb-4">Artist Login</h1>
            <p className="text-foreground/70">
              Access your artist dashboard and manage your bookings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
              <CardDescription>
                Enter your credentials to access your artist profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>

                <div className="text-center text-sm text-foreground/70">
                  Don't have an account?{' '}
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

export default ArtistLogin;

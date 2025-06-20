
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const UserLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    const action = isLogin ? 'Login' : 'Registration';
    toast({
      title: `${action} Successful!`,
      description: isLogin ? "Welcome back! You can now book artists." : "Account created successfully! You can now book artists.",
    });
    
    console.log(`User ${action.toLowerCase()} data:`, formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-16">
        <div className="container max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">
              {isLogin ? 'Login' : 'Sign Up'}
            </h1>
            <p className="text-foreground/70">
              {isLogin 
                ? 'Access your account to book amazing artists' 
                : 'Create an account to start booking artists'
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isLogin ? 'Login to Your Account' : 'Create Your Account'}</CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Enter your credentials to access your bookings'
                  : 'Fill in your details to get started'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {isLogin ? 'Login' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-primary hover:underline"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Login"
                    }
                  </button>
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

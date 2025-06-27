import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ClientFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  location: string;
}

const ClientRegister = () => {
  const [formData, setFormData] = useState<ClientFormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    location: ''
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
      // Validate passwords match
      if (formData.password !== formData.confirm_password) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match",
          variant: "destructive"
        });
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        });
        return;
      }

      console.log('Creating user account...');
      
      // Create user account with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            location: formData.location,
            role: 'client'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('Auth account created, user:', authData.user?.id);

      // Wait a moment for the trigger to potentially create the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user profile was created by the trigger
      if (authData.user) {
        console.log('Checking if client profile was created by trigger...');
        const { data: existingClient, error: checkError } = await supabase
          .from('clients')
          .select('id, full_name, email')
          .eq('id', authData.user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking client profile:', checkError);
        }

        if (!existingClient) {
          console.log('Client profile not found, creating manually...');
          // Create client profile in clients table manually (in case trigger fails)
          const { error: profileError } = await supabase
            .from('clients')
            .insert({
              id: authData.user.id,
              full_name: formData.full_name,
              email: formData.email,
              phone: formData.phone,
              location: formData.location
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here as the auth account was created successfully
            toast({
              title: "Account created with warning",
              description: "Your account was created but there was an issue with your profile. Please contact support.",
              variant: "destructive"
            });
          } else {
            console.log('Client profile created successfully manually');
            toast({
              title: "Registration successful!",
              description: "Your account has been created. Please check your email to verify your account before logging in.",
            });
          }
        } else {
          console.log('Client profile found (created by trigger):', existingClient);
          toast({
            title: "Registration successful!",
            description: "Your account has been created. Please check your email to verify your account before logging in.",
          });
        }
      }

      // Redirect to login page
      navigate('/login');

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      
      if (error.message.includes('duplicate key')) {
        errorMessage = "This email is already registered. Please use a different email or try logging in.";
      } else if (error.message.includes('invalid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message.includes('password')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message.includes('database error')) {
        errorMessage = "There was a database error. Please try again or contact support.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background py-16">
        <div className="container">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-display font-bold">Join as Client</CardTitle>
                <CardDescription>
                  Create your account to book amazing South African artists
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+27 123 456 789"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Province"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Are you an artist?{' '}
                    <Link to="/join-as-artist" className="text-primary hover:underline">
                      Join as an artist
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ClientRegister; 
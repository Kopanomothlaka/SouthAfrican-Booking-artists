import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, Star, MapPin, Plus, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CreateBookingForm from '@/components/CreateBookingForm';
import ArtistBookings from '@/components/ArtistBookings';
import ClientBookingsForArtist from '@/components/ClientBookingsForArtist';

interface ArtistProfile {
  id: string;
  full_name: string;
  artist_name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  bio: string;
  experience: string;
  status: string;
}

const ArtistDashboard = () => {
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showClientBookings, setShowClientBookings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching artist profile:', error);
            toast({
              title: "Error",
              description: "Could not load your profile",
              variant: "destructive",
            });
          } else {
            setArtistProfile(data);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Navigate to artist login page
      navigate('/artist-login');
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      navigate('/artist-login');
    }
  };

  const handleCreateBookingSuccess = () => {
    setShowBookingForm(false);
    setShowBookings(true);
    toast({
      title: "Success",
      description: "Booking created successfully!",
    });
  };

  const handleShowBookings = () => {
    setShowBookings(true);
    setShowBookingForm(false);
  };

  const handleCreateNewBooking = () => {
    setShowBookingForm(true);
    setShowBookings(false);
    setShowClientBookings(false);
  };

  const handleShowClientBookings = () => {
    setShowClientBookings(true);
    setShowBookings(false);
    setShowBookingForm(false);
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'musicians': 'Musician',
      'djs': 'DJ',
      'dancers': 'Dancer',
      'comedians': 'Comedian',
      'mcs': 'MC',
      'bands': 'Band'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Afri-Art Booking Hub</h1>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="container py-16">
          <div className="text-center">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!artistProfile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Afri-Art Booking Hub</h1>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="container py-16">
          <div className="text-center">Could not load your profile.</div>
        </div>
      </div>
    );
  }

  // Show booking form
  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Afri-Art Booking Hub</h1>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="py-16">
          <div className="container">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowBookingForm(false)}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <CreateBookingForm 
              onSuccess={handleCreateBookingSuccess}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show bookings management
  if (showBookings) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Afri-Art Booking Hub</h1>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="py-16">
          <div className="container">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowBookings(false)}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <ArtistBookings onCreateNew={handleCreateNewBooking} />
          </div>
        </div>
      </div>
    );
  }

  // Show client bookings
  if (showClientBookings) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Afri-Art Booking Hub</h1>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="py-16">
          <div className="container">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowClientBookings(false)}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <ClientBookingsForArtist />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Afri-Art Booking Hub</h1>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <div className="py-16">
        <div className="container">
          {/* Artist Info Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-4">Artist Dashboard</h1>
              <p className="text-foreground/70">
                Welcome back! Manage your profile and bookings
              </p>
            </div>
            <div className="text-right">
              <div className="mb-2 text-sm text-foreground/70">
                Logged in as: <span className="font-semibold">{artistProfile.artist_name}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ✓ Approved Artist
            </Badge>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
                <CardDescription>Your artist information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Artist Name:</span>
                  <p className="text-lg font-semibold">{artistProfile.artist_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Category:</span>
                  <p>{getCategoryBadge(artistProfile.category)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Location:</span>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {artistProfile.location}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Statistics
                </CardTitle>
                <CardDescription>Your performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleShowBookings}
                >
                  Manage Bookings
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleShowClientBookings}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Client Bookings
                </Button>
                <Button 
                  className="w-full" 
                  onClick={handleCreateNewBooking}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Booking
                </Button>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bio Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-muted-foreground">{artistProfile.bio}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <p className="text-muted-foreground">{artistProfile.experience}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Email:</span>
                  <p>{artistProfile.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Phone:</span>
                  <p>{artistProfile.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Full Name:</span>
                  <p>{artistProfile.full_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {artistProfile.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard; 
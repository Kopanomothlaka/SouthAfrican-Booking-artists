import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { User, Calendar, MapPin, Phone, Mail, LogOut, BookOpen, Clock, Star, Search } from 'lucide-react';
import ClientBookingForm from '@/components/ClientBookingForm';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  booking_fee: number;
  experience: string;
  created_at: string;
  artist: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface ArtistService {
  id: string;
  title: string;
  description: string;
  category: string;
  booking_fee: number;
  currency: string;
  experience_years: number | null;
  experience_description: string | null;
  location: string | null;
  min_duration_hours: number;
  max_duration_hours: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  images: {
    id: string;
    image_url: string;
    image_name: string;
    is_primary: boolean;
  }[];
  artists: {
    id: string;
    artist_name: string;
    full_name: string;
    email: string;
    phone: string;
  };
  isBooked?: boolean;
  bookingStatus?: string | null;
}

const ClientDashboard = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artists, setArtists] = useState<ArtistService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchArtists();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    }
  };

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch client bookings from the client_bookings table
      const { data, error } = await supabase
        .from('client_bookings')
        .select(`
          id,
          booking_date,
          event_date,
          event_time,
          event_location,
          duration_hours,
          total_amount,
          currency,
          status,
          notes,
          client_notes,
          created_at,
          booking:bookings(
            id,
            title,
            category,
            booking_fee,
            artists!inner(
              id,
              artist_name,
              full_name,
              email,
              phone
            )
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedBookings = (data || []).map((clientBooking: any) => ({
        id: clientBooking.id,
        booking_date: clientBooking.event_date || clientBooking.booking_date,
        booking_time: clientBooking.event_time || 'Not specified',
        status: clientBooking.status,
        booking_fee: clientBooking.total_amount,
        experience: clientBooking.notes || clientBooking.client_notes || '',
        created_at: clientBooking.created_at,
        artist: {
          full_name: clientBooking.booking?.artists?.artist_name || clientBooking.booking?.artists?.full_name || 'Unknown Artist',
          email: clientBooking.booking?.artists?.email || '',
          phone: clientBooking.booking?.artists?.phone || ''
        }
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    }
  };

  const fetchArtists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          title,
          description,
          category,
          booking_fee,
          currency,
          experience_years,
          experience_description,
          location,
          min_duration_hours,
          max_duration_hours,
          contact_email,
          contact_phone,
          created_at,
          images:booking_images(*),
          artists!inner(
            id,
            artist_name,
            full_name,
            email,
            phone
          )
        `)
        .eq('booking_type', 'service')
        .eq('status', 'available')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match the ArtistService interface
      const transformedArtists = (data || []).map((artist: any) => ({
        id: artist.id,
        title: artist.title,
        description: artist.description,
        category: artist.category,
        booking_fee: artist.booking_fee,
        currency: artist.currency,
        experience_years: artist.experience_years,
        experience_description: artist.experience_description,
        location: artist.location,
        min_duration_hours: artist.min_duration_hours,
        max_duration_hours: artist.max_duration_hours,
        contact_email: artist.contact_email,
        contact_phone: artist.contact_phone,
        created_at: artist.created_at,
        images: artist.images || [],
        artists: {
          id: artist.artists?.id || '',
          artist_name: artist.artists?.artist_name || '',
          full_name: artist.artists?.full_name || '',
          email: artist.artists?.email || '',
          phone: artist.artists?.phone || ''
        },
        isBooked: false,
        bookingStatus: null
      }));

      // Check which artists the client has already booked
      const { data: clientBookings, error: bookingsError } = await supabase
        .from('client_bookings')
        .select(`
          booking_id,
          status,
          booking:bookings(
            artist_id
          )
        `)
        .eq('client_id', user.id)
        .in('status', ['pending', 'confirmed', 'completed']);

      if (!bookingsError && clientBookings) {
        // Create a map of booked artist IDs
        const bookedArtistIds = new Map();
        clientBookings.forEach((clientBooking: any) => {
          const artistId = clientBooking.booking?.artist_id;
          if (artistId) {
            bookedArtistIds.set(artistId, clientBooking.status);
          }
        });

        // Add booking status to each artist
        const artistsWithBookingStatus = transformedArtists.map(artist => ({
          ...artist,
          isBooked: bookedArtistIds.has(artist.artists.id),
          bookingStatus: bookedArtistIds.get(artist.artists.id) || null
        }));

        setArtists(artistsWithBookingStatus);
      } else {
        setArtists(transformedArtists);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Error",
        description: "Failed to load artists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleBookNow = (artist: ArtistService) => {
    if (artist.isBooked) {
      toast({
        title: "Already Booked",
        description: `You have already booked this artist. Status: ${artist.bookingStatus}`,
        variant: "destructive"
      });
      return;
    }
    setSelectedArtist(artist);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedArtist(null);
    toast({
      title: "Booking submitted successfully!",
      description: "Your booking request has been sent to the artist. You'll be notified once they confirm.",
    });
    // Refresh bookings to show the new booking
    fetchBookings();
    // Refresh artists to update booking status
    fetchArtists();
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setSelectedArtist(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">✓ Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">⏳ Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">✗ Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">✓ Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 hover:bg-red-700 text-white">✗ Rejected</Badge>;
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">✓ Available</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
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

  const filteredArtists = artists.filter(artist => 
    artist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artists.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AA</span>
              </div>
              <span className="font-bold text-lg">Afri-Art Booking Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-foreground/70">
                Hi, {profile?.full_name || 'Client'}
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
          <p className="text-muted-foreground">Book amazing South African artists for your events</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search artists, categories, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                      <p className="text-sm text-muted-foreground">Client</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                      
                      {profile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                      
                      {profile.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{profile.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Member since {formatDate(profile.created_at)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>My Bookings</span>
                </CardTitle>
                <CardDescription>Your booking history and status</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No bookings yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Book an artist to see your bookings here</p>
                  </div>
                ) : (
                  <>
                    {/* Booking Status Summary */}
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Booking Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Pending:</span>
                          <Badge variant="secondary" className="text-xs">
                            {bookings.filter(b => b.status === 'pending').length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Confirmed:</span>
                          <Badge className="bg-green-500 text-white text-xs">
                            {bookings.filter(b => b.status === 'confirmed').length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Completed:</span>
                          <Badge className="bg-blue-500 text-white text-xs">
                            {bookings.filter(b => b.status === 'completed').length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cancelled:</span>
                          <Badge className="bg-red-500 text-white text-xs">
                            {bookings.filter(b => b.status === 'cancelled').length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{booking.artist.full_name}</h4>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            📅 {formatDate(booking.booking_date)} at {booking.booking_time}
                          </div>
                          <div className="text-xs font-medium mb-1">
                            💰 {formatCurrency(booking.booking_fee)}
                          </div>
                          {booking.experience && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              📝 {booking.experience}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Booked on {formatDate(booking.created_at)}
                          </div>
                        </div>
                      ))}
                      {bookings.length > 3 && (
                        <Button variant="outline" size="sm" className="w-full">
                          View All ({bookings.length})
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Artists List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available Artists</h2>
              <p className="text-muted-foreground">
                {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} available for booking
              </p>
            </div>

            {filteredArtists.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No artists found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'No artists are currently available for booking'}
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArtists.map((artist) => {
                  const primaryImage = artist.images?.find(img => img.is_primary) || artist.images?.[0];
                  const artistName = artist.artists.artist_name || artist.artists.full_name;

                  return (
                    <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop'}
                          alt={artist.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge>{getCategoryLabel(artist.category)}</Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          {artist.isBooked ? (
                            getStatusBadge(artist.bookingStatus || 'pending')
                          ) : (
                            getStatusBadge('available')
                          )}
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg mb-1">{artistName}</h3>
                          <h4 className="text-sm text-muted-foreground mb-2">{artist.title}</h4>
                          <p className="text-sm text-foreground/70 line-clamp-2">
                            {artist.description || 'No description available'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {artist.experience_years && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4" />
                                <span>{artist.experience_years} years</span>
                              </div>
                            )}
                            {artist.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{artist.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {formatCurrency(artist.booking_fee, artist.currency)}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => handleBookNow(artist)}
                          disabled={artist.isBooked}
                          variant={artist.isBooked ? "outline" : "default"}
                        >
                          {artist.isBooked ? 
                            (artist.bookingStatus === 'pending' ? '⏳ Awaiting Confirmation' : 
                             artist.bookingStatus === 'confirmed' ? '✓ Booking Confirmed' : 
                             artist.bookingStatus === 'completed' ? '✓ Session Completed' : 
                             artist.bookingStatus === 'cancelled' ? '✗ Booking Cancelled' :
                             'Already Booked') 
                            : 'Book Now'
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedArtist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ClientBookingForm
              artistId={selectedArtist.artists.id}
              artistName={selectedArtist.artists.artist_name || selectedArtist.artists.full_name}
              artistEmail={selectedArtist.artists.email}
              artistPhone={selectedArtist.artists.phone}
              bookingFee={selectedArtist.booking_fee}
              onSuccess={handleBookingSuccess}
              onCancel={handleBookingCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Star, Phone, Mail, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import ClientBookingForm from '@/components/ClientBookingForm';

interface BookingImage {
  id: string;
  image_url: string;
  image_name: string;
  is_primary: boolean;
  display_order: number;
}

interface Booking {
  id: string;
  title: string;
  description: string;
  category: string;
  booking_fee: number;
  currency: string;
  experience_years: number | null;
  experience_description: string | null;
  availability_start: string | null;
  availability_end: string | null;
  availability_notes: string | null;
  location: string | null;
  max_duration_hours: number | null;
  min_duration_hours: number;
  is_active: boolean;
  status: string;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  images: BookingImage[];
  artists: {
    id: string;
    artist_name: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);
      
      if (user) {
        // Check if user is a client (not an artist)
        const { data: artistData } = await supabase
          .from('artists')
          .select('id')
          .eq('id', user.id)
          .single();
        
        setIsClient(!artistData); // If no artist record, they're a client
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            images:booking_images(*),
            artists!inner(
              id,
              artist_name,
              full_name,
              email,
              phone
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .eq('status', 'available')
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
          return;
        }

        setBooking(bookingData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this artist",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!isClient) {
      toast({
        title: "Access Denied",
        description: "Artists cannot book other artists",
        variant: "destructive"
      });
      return;
    }

    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    toast({
      title: "Booking Submitted!",
      description: "Your booking request has been sent. Check your dashboard for updates.",
    });
    navigate('/client-dashboard');
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
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

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading booking details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Header />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="mb-6">This booking is not available or has been removed.</p>
          <Link to="/artists">
            <Button>Browse All Bookings</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const primaryImage = booking.images?.find(img => img.is_primary) || booking.images?.[0];
  const artistName = booking.artists.artist_name || booking.artists.full_name;

  return (
    <>
      <Header />
      
      <div className="bg-secondary/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
            <div className="w-full md:w-1/3">
              <div className="sticky top-24">
                {/* Primary Image */}
                <div className="relative">
                  <img 
                    src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop'}
                    alt={booking.title}
                    className="rounded-xl shadow-lg w-full object-cover aspect-[3/4]"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Available
                    </Badge>
                  </div>
                </div>
                
                {/* Booking Card */}
                <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Booking Fee</h3>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(booking.booking_fee, booking.currency)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground/70 mb-6">
                    Starting price for a standard booking. Final price may vary based on event details.
                  </p>
                  
                  {isAuthenticated && isClient ? (
                    <Button className="w-full" onClick={handleBookNow}>
                      Book Now
                    </Button>
                  ) : isAuthenticated && !isClient ? (
                    <Button className="w-full" variant="outline" disabled>
                      Artists Cannot Book
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleBookNow}>
                      Login to Book
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge>{getCategoryLabel(booking.category)}</Badge>
                {booking.location && (
                  <div className="flex items-center text-sm text-foreground/70">
                    <MapPin className="h-4 w-4 mr-1" /> {booking.location}
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-display font-bold mb-2">{artistName}</h1>
              <h2 className="text-xl text-foreground/70 mb-6">{booking.title}</h2>
              
              <div className="prose max-w-none mb-8">
                <p>{booking.description || 'No description available.'}</p>
              </div>
              
              {/* Experience and Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {booking.experience_years && (
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <Star className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <h3 className="font-medium text-sm">Experience</h3>
                        <p className="text-foreground/70">{booking.experience_years} years</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardContent className="p-4 flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <h3 className="font-medium text-sm">Duration</h3>
                      <p className="text-foreground/70">
                        Min {booking.min_duration_hours}h
                        {booking.max_duration_hours && ` - Max ${booking.max_duration_hours}h`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Experience Description */}
              {booking.experience_description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-display font-bold mb-4">Experience</h2>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-foreground/80">{booking.experience_description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Availability */}
              {(booking.availability_start || booking.availability_end || booking.availability_notes) && (
                <div className="mb-8">
                  <h2 className="text-2xl font-display font-bold mb-4">Availability</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {(booking.availability_start || booking.availability_end) && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-3" />
                            <span>
                              {booking.availability_start && formatDate(booking.availability_start)}
                              {booking.availability_start && booking.availability_end && ' - '}
                              {booking.availability_end && formatDate(booking.availability_end)}
                            </span>
                          </div>
                        )}
                        {booking.availability_notes && (
                          <p className="text-foreground/80">{booking.availability_notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold mb-4">Contact Information</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-primary mr-3" />
                        <div>
                          <p className="font-medium">{booking.artists.full_name}</p>
                          <p className="text-sm text-foreground/70">Artist Name: {booking.artists.artist_name}</p>
                        </div>
                      </div>
                      
                      {booking.contact_email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-primary mr-3" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-foreground/70">{booking.contact_email}</p>
                          </div>
                        </div>
                      )}
                      
                      {booking.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-primary mr-3" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-foreground/70">{booking.contact_phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gallery */}
              {booking.images && booking.images.length > 1 && (
                <div>
                  <h2 className="text-2xl font-display font-bold mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {booking.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.image_url}
                          alt={image.image_name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {image.is_primary && (
                          <Badge className="absolute top-2 left-2 text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {showBookingForm && booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ClientBookingForm
              artistId={booking.artists.id}
              artistName={booking.artists.artist_name || booking.artists.full_name}
              artistEmail={booking.artists.email}
              artistPhone={booking.artists.phone}
              bookingFee={booking.booking_fee}
              onSuccess={handleBookingSuccess}
              onCancel={handleBookingCancel}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistDetail;

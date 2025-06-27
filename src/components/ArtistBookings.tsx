import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Clock, 
  Star,
  Image as ImageIcon,
  User,
  Phone,
  Mail
} from 'lucide-react';

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
}

interface ArtistBookingsProps {
  onCreateNew?: () => void;
}

const ArtistBookings: React.FC<ArtistBookingsProps> = ({ onCreateNew }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch bookings with images
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          images:booking_images(*)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBookingStatus = async (bookingId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ is_active: isActive })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, is_active: isActive }
          : booking
      ));

      toast({
        title: "Success",
        description: `Booking ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone and will remove all associated images.')) {
      setDeletingBookingId(null);
      return;
    }

    try {
      setDeletingBookingId(bookingId);
      
      // First, delete associated booking images
      const { error: imagesError } = await supabase
        .from('booking_images')
        .delete()
        .eq('booking_id', bookingId);

      if (imagesError) {
        console.error('Error deleting booking images:', imagesError);
        // Continue with booking deletion even if image deletion fails
      }

      // Then delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      setSelectedBooking(null);

      toast({
        title: "Success",
        description: "Booking and all associated images deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      
      let errorMessage = "Failed to delete booking";
      if (error.message.includes('permission')) {
        errorMessage = "You don't have permission to delete this booking";
      } else if (error.message.includes('foreign key')) {
        errorMessage = "Cannot delete booking that has associated client bookings";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDeletingBookingId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      musicians: 'Musician',
      djs: 'DJ',
      dancers: 'Dancer',
      comedians: 'Comedian',
      mcs: 'MC',
      bands: 'Band'
    };
    return categories[category] || category;
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-500';
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'booked': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-muted-foreground">
            Manage your booking offers and availability
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Booking
        </Button>
      </div>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first booking to start attracting clients
              </p>
              <Button onClick={onCreateNew}>
                Create Your First Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              {/* Primary Image */}
              <div className="relative h-48 bg-gray-100">
                {booking.images && booking.images.length > 0 ? (
                  <img
                    src={booking.images.find(img => img.is_primary)?.image_url || booking.images[0].image_url}
                    alt={booking.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    className={`${getStatusColor(booking.status, booking.is_active)} text-white`}
                  >
                    {booking.is_active ? booking.status : 'inactive'}
                  </Badge>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">
                    {getCategoryLabel(booking.category)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{booking.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {booking.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Price */}
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(booking.booking_fee, booking.currency)}
                </div>

                {/* Location */}
                {booking.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {booking.location}
                  </div>
                )}

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Min {booking.min_duration_hours}h
                  {booking.max_duration_hours && ` - Max ${booking.max_duration_hours}h`}
                </div>

                {/* Experience */}
                {booking.experience_years && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    {booking.experience_years} years experience
                  </div>
                )}

                {/* Availability */}
                {(booking.availability_start || booking.availability_end) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {booking.availability_start && formatDate(booking.availability_start)}
                    {booking.availability_start && booking.availability_end && ' - '}
                    {booking.availability_end && formatDate(booking.availability_end)}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBookingStatus(booking.id, !booking.is_active)}
                    className="flex-1"
                  >
                    {booking.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBooking(booking.id)}
                    disabled={deletingBookingId === booking.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingBookingId === booking.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedBooking.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  ✕
                </Button>
              </div>

              {/* Images */}
              {selectedBooking.images && selectedBooking.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedBooking.images.map((image) => (
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

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {selectedBooking.description || 'No description provided'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    <Badge variant="secondary">
                      {getCategoryLabel(selectedBooking.category)}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Pricing</h3>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedBooking.booking_fee, selectedBooking.currency)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Duration</h3>
                    <p className="text-muted-foreground">
                      Minimum: {selectedBooking.min_duration_hours} hour(s)
                      {selectedBooking.max_duration_hours && (
                        <span> • Maximum: {selectedBooking.max_duration_hours} hour(s)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Experience</h3>
                    {selectedBooking.experience_years ? (
                      <p className="text-muted-foreground">
                        {selectedBooking.experience_years} years of experience
                      </p>
                    ) : (
                      <p className="text-muted-foreground">Not specified</p>
                    )}
                    {selectedBooking.experience_description && (
                      <p className="text-muted-foreground mt-2">
                        {selectedBooking.experience_description}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-muted-foreground">
                      {selectedBooking.location || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Availability</h3>
                    <p className="text-muted-foreground">
                      From: {formatDate(selectedBooking.availability_start)}<br />
                      To: {formatDate(selectedBooking.availability_end)}
                    </p>
                    {selectedBooking.availability_notes && (
                      <p className="text-muted-foreground mt-2">
                        Notes: {selectedBooking.availability_notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      {selectedBooking.contact_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          {selectedBooking.contact_email}
                        </div>
                      )}
                      {selectedBooking.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          {selectedBooking.contact_phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleBookingStatus(selectedBooking.id, !selectedBooking.is_active)}
                >
                  {selectedBooking.is_active ? 'Deactivate' : 'Activate'} Booking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deleteBooking(selectedBooking.id)}
                  disabled={deletingBookingId === selectedBooking.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingBookingId === selectedBooking.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Booking'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistBookings; 
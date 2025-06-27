import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface ClientBooking {
  id: string;
  created_at: string;
  booking_date: string;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  duration_hours: number;
  total_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  artist_notes: string | null;
  client_notes: string | null;
  client: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  booking: {
    id: string;
    title: string;
    category: string;
    booking_fee: number;
  };
}

const ClientBookingsForArtist: React.FC = () => {
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ClientBooking | null>(null);

  useEffect(() => {
    fetchClientBookings();
  }, []);

  const fetchClientBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch client bookings for this artist's services
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('client_bookings')
        .select(`
          *,
          client:clients(id, full_name, email, phone),
          booking:bookings(id, title, category, booking_fee)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      setClientBookings(bookingsData || []);
    } catch (error: any) {
      console.error('Error fetching client bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load client bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('client_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      setClientBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      ));

      setSelectedBooking(prev => prev?.id === bookingId ? { ...prev, status } : prev);

      toast({
        title: "Success",
        description: `Booking status updated to ${status}`,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <Star className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
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

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not specified';
    return timeString;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Bookings</h2>
          <p className="text-muted-foreground">
            View and manage bookings from clients
          </p>
        </div>
      </div>

      {clientBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No client bookings yet</h3>
              <p className="text-muted-foreground">
                When clients book your services, they will appear here with their details
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientBookings.map((clientBooking) => (
            <Card key={clientBooking.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{clientBooking.booking.title}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      Booked by {clientBooking.client.full_name}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`${getStatusColor(clientBooking.status)} text-white flex items-center gap-1`}
                  >
                    {getStatusIcon(clientBooking.status)}
                    {clientBooking.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Client Info */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{clientBooking.client.full_name}</span>
                </div>

                {/* Client Contact */}
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{clientBooking.client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{clientBooking.client.phone}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(clientBooking.total_amount, clientBooking.currency)}
                </div>

                {/* Event Date */}
                {clientBooking.event_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(clientBooking.event_date)}
                    {clientBooking.event_time && ` at ${formatTime(clientBooking.event_time)}`}
                  </div>
                )}

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {clientBooking.duration_hours} hour(s)
                </div>

                {/* Location */}
                {clientBooking.event_location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {clientBooking.event_location}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBooking(clientBooking)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {clientBooking.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(clientBooking.id, 'confirmed')}
                      className="flex-1"
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedBooking.booking.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  ✕
                </Button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <Badge 
                  className={`${getStatusColor(selectedBooking.status)} text-white flex items-center gap-2 w-fit`}
                >
                  {getStatusIcon(selectedBooking.status)}
                  {selectedBooking.status.toUpperCase()}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Client Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{selectedBooking.client.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedBooking.client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedBooking.client.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Booking Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Booking Date:</span>
                        <p>{formatDate(selectedBooking.booking_date)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Event Date:</span>
                        <p>{formatDate(selectedBooking.event_date)}</p>
                      </div>
                      {selectedBooking.event_time && (
                        <div>
                          <span className="text-sm font-medium">Event Time:</span>
                          <p>{formatTime(selectedBooking.event_time)}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium">Duration:</span>
                        <p>{selectedBooking.duration_hours} hour(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Pricing</h3>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedBooking.total_amount, selectedBooking.currency)}
                    </div>
                  </div>

                  {selectedBooking.event_location && (
                    <div>
                      <h3 className="font-semibold mb-2">Event Location</h3>
                      <p className="text-muted-foreground">{selectedBooking.event_location}</p>
                    </div>
                  )}

                  {selectedBooking.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Client Notes</h3>
                      <p className="text-muted-foreground">{selectedBooking.notes}</p>
                    </div>
                  )}

                  {selectedBooking.client_notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Additional Client Notes</h3>
                      <p className="text-muted-foreground">{selectedBooking.client_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                    >
                      Confirm Booking
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBookingsForArtist;

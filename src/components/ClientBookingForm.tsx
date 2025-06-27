import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, MessageSquare, User, Phone, Mail } from 'lucide-react';

interface ClientBookingFormProps {
  artistId: string;
  artistName: string;
  artistEmail: string;
  artistPhone: string;
  bookingFee: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BookingFormData {
  booking_date: string;
  booking_time: string;
  experience: string;
  client_name: string;
  client_phone: string;
  client_email: string;
}

const ClientBookingForm = ({ 
  artistId, 
  artistName, 
  artistEmail, 
  artistPhone, 
  bookingFee, 
  onSuccess, 
  onCancel 
}: ClientBookingFormProps) => {
  const [formData, setFormData] = useState<BookingFormData>({
    booking_date: '',
    booking_time: '',
    experience: '',
    client_name: '',
    client_phone: '',
    client_email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to book an artist",
          variant: "destructive"
        });
        return;
      }

      // Check if client has already booked this artist
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id, status, booking_date')
        .eq('artist_id', artistId)
        .eq('client_id', user.id)
        .eq('booking_type', 'booking')
        .in('status', ['pending', 'confirmed', 'completed']);

      if (checkError) {
        console.error('Error checking existing bookings:', checkError);
      } else if (existingBookings && existingBookings.length > 0) {
        const existingBooking = existingBookings[0];
        let statusMessage = '';
        
        switch (existingBooking.status) {
          case 'pending':
            statusMessage = 'You already have a pending booking with this artist.';
            break;
          case 'confirmed':
            statusMessage = 'You already have a confirmed booking with this artist.';
            break;
          case 'completed':
            statusMessage = 'You have already booked this artist before.';
            break;
          default:
            statusMessage = 'You already have a booking with this artist.';
        }

        toast({
          title: "Booking already exists",
          description: statusMessage,
          variant: "destructive"
        });
        return;
      }

      // Validate required fields
      if (!formData.booking_date || !formData.booking_time || !formData.experience) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Check if the selected date is in the future
      const selectedDate = new Date(formData.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        toast({
          title: "Invalid date",
          description: "Please select a future date for your booking",
          variant: "destructive"
        });
        return;
      }

      // Create booking first
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          artist_id: artistId,
          client_id: user.id,
          booking_date: formData.booking_date,
          booking_time: formData.booking_time,
          experience: formData.experience,
          booking_fee: bookingFee,
          status: 'pending',
          booking_type: 'booking',
          client_name: formData.client_name || user.user_metadata?.full_name || 'Client',
          client_phone: formData.client_phone,
          client_email: formData.client_email || user.email,
          title: `Booking with ${artistName}`,
          description: formData.experience,
          category: 'booking',
          currency: 'ZAR',
          is_active: true
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Create client_booking record
      const { error: clientBookingError } = await supabase
        .from('client_bookings')
        .insert({
          client_id: user.id,
          booking_id: bookingData.id,
          booking_date: formData.booking_date,
          event_date: formData.booking_date,
          event_time: formData.booking_time,
          total_amount: bookingFee,
          currency: 'ZAR',
          status: 'pending',
          notes: formData.experience,
          client_notes: formData.experience
        });

      if (clientBookingError) {
        // If client_booking creation fails, delete the booking record
        await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingData.id);
        throw clientBookingError;
      }

      toast({
        title: "Booking submitted successfully!",
        description: `Your booking request has been sent to ${artistName}. You'll be notified once they confirm.`,
      });

      onSuccess();

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Book {artistName}</span>
        </CardTitle>
        <CardDescription>
          Schedule your session with this amazing artist
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Artist Info */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Artist Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{artistName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{artistEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{artistPhone}</span>
              </div>
              <div className="font-semibold text-primary">
                Booking Fee: R{bookingFee}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="booking_date"
                  name="booking_date"
                  type="date"
                  value={formData.booking_date}
                  onChange={handleInputChange}
                  min={today}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking_time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="booking_time"
                  name="booking_time"
                  type="time"
                  value={formData.booking_time}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">What would you like to experience? *</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Describe what you'd like to experience (e.g., portrait painting, landscape art, abstract work, etc.)"
                className="pl-10 min-h-[80px]"
                required
              />
            </div>
          </div>

          {/* Client Contact Info (Optional) */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Information (Optional)</h4>
            <p className="text-sm text-muted-foreground">
              Provide additional contact details if you'd like the artist to reach out directly
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="client_name">Your Name</Label>
              <Input
                id="client_name"
                name="client_name"
                type="text"
                value={formData.client_name}
                onChange={handleInputChange}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_phone">Phone Number</Label>
              <Input
                id="client_phone"
                name="client_phone"
                type="tel"
                value={formData.client_phone}
                onChange={handleInputChange}
                placeholder="+27 123 456 789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                name="client_email"
                type="email"
                value={formData.client_email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Book Session"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientBookingForm; 
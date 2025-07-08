import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, ArrowRight, Home, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { payGateService } from '@/lib/paygate-service';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('processing');

  const bookingId = searchParams.get('booking_id');
  const payRequestId = searchParams.get('PAY_REQUEST_ID');
  const transactionStatus = searchParams.get('TRANSACTION_STATUS');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      if (!bookingId) {
        toast({
          title: "Error",
          description: "No booking ID found",
          variant: "destructive"
        });
        navigate('/client-dashboard');
        return;
      }

      try {
        setLoading(true);

        // Process PayGate return parameters
        const statusResult = await payGateService.processPaymentReturn(searchParams);
        
        if (statusResult.success) {
          setPaymentStatus(statusResult.status || 'processing');

          // Update booking payment status
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
              payment_status: statusResult.status,
              payment_intent_id: payRequestId,
              status: statusResult.status === 'completed' ? 'confirmed' : 'pending'
            })
            .eq('id', bookingId);

          if (updateError) {
            console.error('Error updating booking:', updateError);
          }

          // Fetch booking details
          const { data: bookingData, error: fetchError } = await supabase
            .from('bookings')
            .select(`
              *,
              artists!inner(
                artist_name,
                full_name,
                email,
                phone
              )
            `)
            .eq('id', bookingId)
            .single();

          if (fetchError) {
            console.error('Error fetching booking:', fetchError);
          } else {
            setBooking(bookingData);
          }

          // Show appropriate toast message
          if (statusResult.status === 'completed') {
            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed and payment processed.",
            });
          } else if (statusResult.status === 'failed') {
            toast({
              title: "Payment Failed",
              description: "There was an issue with your payment. Please try again.",
              variant: "destructive"
            });
          } else if (statusResult.status === 'cancelled') {
            toast({
              title: "Payment Cancelled",
              description: "Your payment was cancelled. You can try again later.",
              variant: "destructive"
            });
          }

        } else {
          throw new Error(statusResult.error || 'Payment processing failed');
        }

      } catch (error: any) {
        console.error('Error handling payment return:', error);
        setPaymentStatus('failed');
        toast({
          title: "Error",
          description: "There was an error processing your payment return",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    handlePaymentReturn();
  }, [bookingId, payRequestId, transactionStatus, searchParams, navigate]);

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          title: "Payment Successful!",
          description: "Your booking has been confirmed and payment processed successfully",
          bgColor: "bg-green-100",
          textColor: "text-green-600"
        };
      case 'failed':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          title: "Payment Failed",
          description: "There was an issue with your payment. Please try again or contact support.",
          bgColor: "bg-red-100",
          textColor: "text-red-600"
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-8 w-8 text-yellow-600" />,
          title: "Payment Cancelled",
          description: "Your payment was cancelled. You can try again later.",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-600"
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-blue-600" />,
          title: "Processing Payment",
          description: "We're processing your payment. Please wait...",
          bgColor: "bg-blue-100",
          textColor: "text-blue-600"
        };
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground/70">Processing your payment...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusConfig = getStatusConfig(paymentStatus);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-16">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="text-center">
            <CardHeader>
              <div className={`mx-auto mb-4 w-16 h-16 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}>
                {statusConfig.icon}
              </div>
              <CardTitle className="text-2xl">{statusConfig.title}</CardTitle>
              <CardDescription>
                {statusConfig.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {booking && paymentStatus === 'completed' && (
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Artist</h3>
                      <p className="text-lg font-medium">
                        {booking.artists?.artist_name || booking.artists?.full_name}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Booking Date</h3>
                      <p className="text-lg font-medium">
                        {formatDate(booking.booking_date)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Time</h3>
                      <p className="text-lg font-medium">{booking.booking_time}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Amount Paid</h3>
                      <p className="text-lg font-medium text-primary">
                        {formatCurrency(booking.booking_fee, booking.currency)}
                      </p>
                    </div>
                  </div>
                  
                  {booking.experience && (
                    <div className="text-left">
                      <h3 className="font-semibold text-sm text-muted-foreground">Event Details</h3>
                      <p className="text-sm">{booking.experience}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {paymentStatus === 'completed' && (
                  <div className="text-sm text-muted-foreground">
                    <p>You will receive a confirmation email shortly with all the details.</p>
                    <p>The artist will contact you to finalize the arrangements.</p>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="text-sm text-muted-foreground">
                    <p>If you believe this is an error, please contact our support team.</p>
                    <p>You can also try booking again from your dashboard.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => navigate('/client-dashboard')}
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {paymentStatus === 'completed' ? 'View My Bookings' : 'Back to Dashboard'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccess; 
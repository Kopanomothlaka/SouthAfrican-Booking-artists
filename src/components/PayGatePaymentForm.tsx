import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { payGateService } from '@/lib/paygate-service';

interface PayGatePaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  artistName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PayGatePaymentForm: React.FC<PayGatePaymentFormProps> = ({
  bookingId,
  amount,
  currency,
  artistName,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentError, setPaymentError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentError('');

    if (!email) {
      setPaymentError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const reference = `BOOKING_${bookingId}_${Date.now()}`;
      
      const result = await payGateService.initiatePayment(
        bookingId,
        amount,
        email,
        reference
      );

      if (result.success && result.paymentUrl) {
        // Redirect to PayGate payment page
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Payment initiation failed');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment initiation failed';
      setPaymentError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Complete Payment</span>
        </CardTitle>
        <CardDescription>
          Secure payment for your booking with {artistName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(amount, currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Payment confirmation will be sent to this email
            </p>
          </div>

          {paymentError && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{paymentError}</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-1">Secure Payment</h4>
                <p className="text-blue-700">
                  You'll be redirected to PayGate's secure payment page. 
                  Your payment information is protected by bank-level security.
                </p>
              </div>
            </div>
          </div>

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
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(amount, currency)}`
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <img 
              src="https://www.paygate.co.za/wp-content/uploads/2019/08/paygate-logo.png" 
              alt="PayGate" 
              className="h-6 opacity-60"
            />
            <span>Powered by PayGate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayGatePaymentForm; 
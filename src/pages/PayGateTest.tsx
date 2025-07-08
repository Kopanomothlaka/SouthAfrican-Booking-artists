import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { payGateService } from '@/lib/paygate-service';
import { generateChecksum, formatAmountForPayGate } from '@/lib/paygate';
import { toast } from '@/hooks/use-toast';

const PayGateTest = () => {
  const [amount, setAmount] = useState('100');
  const [email, setEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testPayGate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const bookingId = 'test_booking_' + Date.now();
      const reference = 'TEST_REF_' + Date.now();
      
      console.log('Testing PayGate with:', {
        bookingId,
        amount: parseFloat(amount),
        email,
        reference
      });

      const result = await payGateService.initiatePayment(
        bookingId,
        parseFloat(amount),
        email,
        reference
      );

      setResult(result);
      
      if (result.success) {
        toast({
          title: "PayGate Test Successful",
          description: "Payment initiated successfully",
        });
      } else {
        toast({
          title: "PayGate Test Failed",
          description: result.error,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Test error:', error);
      setResult({ success: false, error: error.message });
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testChecksum = () => {
    const testData = {
      PAYGATE_ID: '17793750',
      REFERENCE: 'TEST_REF',
      AMOUNT: formatAmountForPayGate(100),
      CURRENCY: 'ZAR',
      RETURN_URL: 'http://localhost:8082/payment-success',
      NOTIFY_URL: 'http://localhost:8082/api/payment-notify',
      LOCALE: 'en-za',
      COUNTRY: 'ZAF',
      EMAIL: 'test@example.com',
      CHECKSUM: ''
    };

    const checksum = generateChecksum(testData, 'cbzkzybkzq2r7');
    console.log('Test checksum:', checksum);
    console.log('Test data:', testData);
    
    toast({
      title: "Checksum Test",
      description: `Generated checksum: ${checksum}`,
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>PayGate Integration Test</CardTitle>
          <CardDescription>
            Test your PayGate payment integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ZAR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={testPayGate} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Testing..." : "Test PayGate Payment"}
            </Button>
            <Button 
              onClick={testChecksum} 
              variant="outline"
            >
              Test Checksum
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayGateTest; 
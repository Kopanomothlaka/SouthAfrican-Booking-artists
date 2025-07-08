import axios from 'axios';
import { supabase } from './supabase';
import { 
  PayGateConfig, 
  PayGatePaymentRequest, 
  PayGatePaymentResponse,
  PAYGATE_ENDPOINTS,
  generateChecksum,
  formatAmountForPayGate
} from './paygate';

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  payRequestId?: string;
  error?: string;
}

export interface PaymentStatus {
  success: boolean;
  status?: string;
  transactionId?: string;
  error?: string;
}

class PayGateService {
  private config: PayGateConfig;

  constructor() {
    this.config = {
      payGateId: import.meta.env.VITE_PAYGATE_ID || '17793750',
      payGateKey: import.meta.env.VITE_PAYGATE_KEY || 'cbzkzybkzq2r7',
      environment: (import.meta.env.VITE_PAYGATE_ENV as 'test' | 'live') || 'test'
    };
    
    console.log('PayGate Config:', {
      payGateId: this.config.payGateId,
      environment: this.config.environment,
      keyLength: this.config.payGateKey.length
    });
  }

  async initiatePayment(
    bookingId: string,
    amount: number,
    email: string,
    reference: string
  ): Promise<PaymentResult> {
    try {
      console.log('Initiating PayGate payment:', {
        bookingId,
        amount,
        email,
        reference
      });

      // Call our backend proxy instead of PayGate directly
      const response = await axios.post('http://localhost:3001/api/paygate/initiate', {
        bookingId,
        amount,
        email,
        reference
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        // Update booking with payment request ID
        await this.updateBookingPaymentInfo(bookingId, response.data.payRequestId);
        
        return {
          success: true,
          paymentUrl: response.data.paymentUrl,
          payRequestId: response.data.payRequestId
        };
      } else {
        throw new Error(response.data.error || 'Payment initiation failed');
      }

    } catch (error: any) {
      console.error('PayGate payment initiation error:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        return {
          success: false,
          error: error.response.data.error || error.response.data.message || 'Payment initiation failed'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Payment initiation failed'
      };
    }
  }

  private async simulatePayGateRequest(data: PayGatePaymentRequest): Promise<any> {
    try {
      // Convert data to URL-encoded format for PayGate
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      console.log('Sending to PayGate:', formData.toString());

      // Make actual HTTP request to PayGate
      const response = await axios.post(PAYGATE_ENDPOINTS[this.config.environment], formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('PayGate response:', response.data);

      // Parse PayGate response
      const responseData = response.data;
      
      if (responseData.ERROR) {
        throw new Error(responseData.ERROR);
      }

      if (responseData.PAY_REQUEST_ID) {
        return {
          success: true,
          paymentUrl: `${PAYGATE_ENDPOINTS[this.config.environment]}?PAY_REQUEST_ID=${responseData.PAY_REQUEST_ID}&CHECKSUM=${responseData.CHECKSUM}`,
          payRequestId: responseData.PAY_REQUEST_ID
        };
      } else {
        throw new Error('Invalid response from PayGate');
      }

    } catch (error: any) {
      console.error('PayGate API error:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
      throw new Error(error.response?.data?.ERROR || error.message || 'Payment initiation failed');
    }
  }

  private async updateBookingPaymentInfo(bookingId: string, payRequestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          payment_intent_id: payRequestId,
          payment_status: 'pending'
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking payment info:', error);
      }
    } catch (error) {
      console.error('Error updating booking payment info:', error);
    }
  }

  async checkPaymentStatus(payRequestId: string): Promise<PaymentStatus> {
    try {
      // In a real implementation, you'd query PayGate's status endpoint
      // For now, we'll simulate the response
      const response = await this.simulateStatusCheck(payRequestId);
      
      return {
        success: true,
        status: response.status,
        transactionId: response.transactionId
      };

    } catch (error: any) {
      console.error('PayGate status check error:', error);
      return {
        success: false,
        error: error.message || 'Status check failed'
      };
    }
  }

  private async simulateStatusCheck(payRequestId: string): Promise<any> {
    // Simulate PayGate status check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'COMPLETE',
          transactionId: `TXN_${Date.now()}`
        });
      }, 500);
    });
  }

  async processPaymentReturn(params: URLSearchParams): Promise<PaymentStatus> {
    try {
      const payRequestId = params.get('PAY_REQUEST_ID');
      const transactionStatus = params.get('TRANSACTION_STATUS');
      const checksum = params.get('CHECKSUM');

      if (!payRequestId) {
        throw new Error('No payment request ID received');
      }

      // Verify checksum in production
      // For now, we'll assume it's valid

      let status = 'pending';
      if (transactionStatus === '1') {
        status = 'completed';
      } else if (transactionStatus === '2') {
        status = 'failed';
      } else if (transactionStatus === '0') {
        status = 'cancelled';
      }

      return {
        success: true,
        status,
        transactionId: payRequestId
      };

    } catch (error: any) {
      console.error('PayGate return processing error:', error);
      return {
        success: false,
        error: error.message || 'Return processing failed'
      };
    }
  }
}

export const payGateService = new PayGateService(); 
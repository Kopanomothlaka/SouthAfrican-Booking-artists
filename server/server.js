const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PayGate Configuration
const PAYGATE_CONFIG = {
  payGateId: process.env.PAYGATE_ID || '17793750',
  payGateKey: process.env.PAYGATE_KEY || 'cbzkzybkzq2r7',
  environment: process.env.PAYGATE_ENV || 'test'
};

const PAYGATE_ENDPOINTS = {
  test: 'https://secure.paygate.co.za/payweb3/initiate.trans',
  live: 'https://secure.paygate.co.za/payweb3/initiate.trans'
};

// Generate PayGate checksum
function generateChecksum(data, payGateKey) {
  const dataWithoutChecksum = { ...data };
  delete dataWithoutChecksum.CHECKSUM;
  
  const sortedKeys = Object.keys(dataWithoutChecksum).sort();
  const checksumString = sortedKeys
    .map(key => dataWithoutChecksum[key])
    .join('');
  
  const finalString = checksumString + payGateKey;
  return crypto.createHash('md5').update(finalString).digest('hex');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Payment server is running',
    config: {
      payGateId: PAYGATE_CONFIG.payGateId,
      environment: PAYGATE_CONFIG.environment
    }
  });
});

// PayGate payment initiation endpoint
app.post('/api/paygate/initiate', async (req, res) => {
  try {
    const { bookingId, amount, email, reference } = req.body;

    if (!bookingId || !amount || !email || !reference) {
      return res.status(400).json({
        error: 'Missing required fields: bookingId, amount, email, and reference are required'
      });
    }

    // Format amount for PayGate (in cents)
    const amountInCents = Math.round(amount * 100);

    // Prepare PayGate request data
    const paymentData = {
      PAYGATE_ID: PAYGATE_CONFIG.payGateId,
      REFERENCE: reference,
      AMOUNT: amountInCents,
      CURRENCY: 'ZAR',
      RETURN_URL: `${req.headers.origin}/payment-success?booking_id=${bookingId}`,
      NOTIFY_URL: `${req.headers.origin}/api/payment-notify`,
      LOCALE: 'en-za',
      COUNTRY: 'ZAF',
      EMAIL: email,
      CHECKSUM: ''
    };

    // Generate checksum
    paymentData.CHECKSUM = generateChecksum(paymentData, PAYGATE_CONFIG.payGateKey);

    console.log('PayGate Request Data:', paymentData);

    // Convert to URL-encoded format
    const formData = new URLSearchParams();
    Object.entries(paymentData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Make request to PayGate
    const response = await axios.post(PAYGATE_ENDPOINTS[PAYGATE_CONFIG.environment], formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    });

    console.log('PayGate Response:', response.data);

    // Parse PayGate response
    const responseData = response.data;
    
    if (responseData.ERROR) {
      return res.status(400).json({
        error: responseData.ERROR,
        details: responseData
      });
    }

    if (responseData.PAY_REQUEST_ID) {
      res.json({
        success: true,
        payRequestId: responseData.PAY_REQUEST_ID,
        paymentUrl: `${PAYGATE_ENDPOINTS[PAYGATE_CONFIG.environment]}?PAY_REQUEST_ID=${responseData.PAY_REQUEST_ID}&CHECKSUM=${responseData.CHECKSUM}`,
        checksum: responseData.CHECKSUM
      });
    } else {
      res.status(400).json({
        error: 'Invalid response from PayGate',
        details: responseData
      });
    }

  } catch (error) {
    console.error('PayGate API error:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      res.status(error.response.status).json({
        error: 'PayGate API error',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Network error or PayGate service unavailable',
        message: error.message
      });
    }
  }
});

// Payment notification endpoint (for webhooks)
app.post('/api/payment-notify', (req, res) => {
  console.log('Payment notification received:', req.body);
  res.json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`PayGate config:`, {
    payGateId: PAYGATE_CONFIG.payGateId,
    environment: PAYGATE_CONFIG.environment
  });
}); 
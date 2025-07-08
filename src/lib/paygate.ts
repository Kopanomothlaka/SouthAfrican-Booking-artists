import MD5 from 'crypto-js/md5';

// PayGate Configuration for South African payments
export interface PayGateConfig {
  payGateId: string;
  payGateKey: string;
  environment: 'test' | 'live';
}

export interface PayGatePaymentRequest {
  PAYGATE_ID: string;
  REFERENCE: string;
  AMOUNT: number;
  CURRENCY: string;
  RETURN_URL: string;
  NOTIFY_URL: string;
  LOCALE: string;
  COUNTRY: string;
  EMAIL: string;
  CHECKSUM: string;
}

export interface PayGatePaymentResponse {
  PAYGATE_ID: string;
  PAY_REQUEST_ID: string;
  REFERENCE: string;
  AMOUNT: number;
  CURRENCY: string;
  RETURN_URL: string;
  NOTIFY_URL: string;
  LOCALE: string;
  COUNTRY: string;
  EMAIL: string;
  CHECKSUM: string;
  PAYMENT_METHOD: string;
  PAYMENT_STATUS: string;
}

// PayGate API endpoints
export const PAYGATE_ENDPOINTS = {
  test: 'https://secure.paygate.co.za/payweb3/initiate.trans',
  live: 'https://secure.paygate.co.za/payweb3/initiate.trans'
};

// Generate PayGate checksum
export const generateChecksum = (data: Record<string, any>, payGateKey: string): string => {
  // Remove CHECKSUM from data if it exists
  const dataWithoutChecksum = { ...data };
  delete dataWithoutChecksum.CHECKSUM;
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(dataWithoutChecksum).sort();
  
  // Create checksum string
  const checksumString = sortedKeys
    .map(key => dataWithoutChecksum[key])
    .join('');
  
  // Add the PayGate key
  const finalString = checksumString + payGateKey;
  
  // Use proper MD5 hash
  return MD5(finalString).toString();
};

// Format amount for PayGate (in cents)
export const formatAmountForPayGate = (amount: number): number => {
  return Math.round(amount * 100);
};

// Format amount from PayGate (from cents)
export const formatAmountFromPayGate = (amount: number): number => {
  return amount / 100;
}; 
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PaymentStatusProps {
  status: string;
  amount?: number;
  currency?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ 
  status, 
  amount, 
  currency = 'ZAR' 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'complete':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Paid',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Pending',
          variant: 'secondary' as const,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'failed':
      case 'cancelled':
      case 'canceled':
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: 'Failed',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const config = getStatusConfig(status);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={config.variant} className="flex items-center space-x-1">
        {config.icon}
        <span>{config.label}</span>
      </Badge>
      {amount && (
        <span className="text-sm font-medium">
          {formatCurrency(amount, currency)}
        </span>
      )}
    </div>
  );
};

export default PaymentStatus; 
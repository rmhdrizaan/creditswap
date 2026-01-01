import api from './api';

export const purchaseCredits = async (data) => {
  try {
    const response = await api.post('/payments/purchase', data);
    return response.data;
  } catch (error) {
    console.error('Error purchasing credits:', error);
    throw error;
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/payments/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

export const getCreditPackages = async () => {
  try {
    const response = await api.get('/payments/packages');
    return response.data;
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    throw error;
  }
};

export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

// Get payment methods
export const getPaymentMethods = async () => {
  try {
    // In a real app, this would come from the API
    // For now, return mock data
    return {
      success: true,
      data: [
        { 
          id: 'card', 
          name: 'Credit/Debit Card', 
          icon: 'credit-card',
          supportedCards: ['visa', 'mastercard', 'amex'],
          processingFee: 0
        },
        { 
          id: 'paypal', 
          name: 'PayPal', 
          icon: 'paypal',
          processingFee: 0.029 // 2.9% + $0.30
        },
        { 
          id: 'crypto', 
          name: 'Cryptocurrency', 
          icon: 'bitcoin',
          supportedCoins: ['BTC', 'ETH', 'USDT'],
          processingFee: 0.01 // 1%
        },
        { 
          id: 'bank', 
          name: 'Bank Transfer', 
          icon: 'bank',
          processingTime: '1-3 business days',
          processingFee: 0
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Create payment intent (for Stripe/PayPal integration)
export const createPaymentIntent = async (amount, currency = 'usd') => {
  try {
    const response = await api.post('/payments/create-intent', {
      amount,
      currency
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Validate coupon code
export const validateCoupon = async (code) => {
  try {
    const response = await api.post('/payments/validate-coupon', { code });
    return response.data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

// Get user's purchase statistics
export const getPurchaseStats = async () => {
  try {
    const response = await api.get('/payments/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    throw error;
  }
};

export default {
  purchaseCredits,
  getPaymentHistory,
  getCreditPackages,
  getPaymentStatus,
  getPaymentMethods,
  createPaymentIntent,
  validateCoupon,
  getPurchaseStats
};
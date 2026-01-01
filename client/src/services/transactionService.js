import api from './api';

export const getMyTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transactions', { params });
    
    // Handle different response structures
    if (response.data?.data) {
      return response.data; // New format: { success: true, data: [], pagination: {} }
    } else if (Array.isArray(response.data)) {
      return { success: true, data: response.data }; // Fallback to array
    } else {
      return { success: true, data: [] }; // Empty if no data
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    // Return empty structure on error
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch transactions'
    };
  }
};

export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};

export const getTransactionStats = async () => {
  try {
    const response = await api.get('/transactions/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    
    // Return default stats on error
    return {
      success: false,
      data: {
        totalEarned: 0,
        totalSpent: 0,
        totalTransactions: 0,
        recentTransactions: 0,
        netBalance: 0
      }
    };
  }
};

export const exportTransactions = async (format = 'csv', startDate, endDate) => {
  try {
    const response = await api.get('/transactions/export', {
      params: { format, startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
};

// Mock transaction data for testing/development
const MOCK_TRANSACTIONS = [
  {
    _id: 'txn_1',
    sender: null,
    receiver: 'user_id',
    amount: 100,
    type: 'credit_purchase',
    status: 'completed',
    description: 'Initial credit purchase',
    metadata: { packageId: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'txn_2',
    sender: 'user_id',
    receiver: 'worker_1',
    amount: 50,
    type: 'payment',
    status: 'completed',
    description: 'Payment for website design',
    listing: { _id: 'listing_1', title: 'Website Design', credits: 50 },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'txn_3',
    sender: 'client_1',
    receiver: 'user_id',
    amount: 75,
    type: 'payment',
    status: 'completed',
    description: 'Payment for logo design',
    listing: { _id: 'listing_2', title: 'Logo Design', credits: 75 },
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Mock function for development (remove in production)
export const getMockTransactions = () => {
  return {
    success: true,
    data: MOCK_TRANSACTIONS,
    pagination: {
      page: 1,
      limit: 10,
      total: 3,
      pages: 1
    }
  };
};

export default {
  getMyTransactions,
  getTransactionById,
  getTransactionStats,
  exportTransactions,
  getMockTransactions
};
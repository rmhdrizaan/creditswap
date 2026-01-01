import api from './api';

export const getMyTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
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

export const createTransaction = async (data) => {
  try {
    const response = await api.post('/transactions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
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

export const getTransactionStats = async () => {
  try {
    const response = await api.get('/transactions/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
};

// Get transactions by type
export const getTransactionsByType = async (type, params = {}) => {
  try {
    const response = await api.get(`/transactions/type/${type}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} transactions:`, error);
    throw error;
  }
};

export default {
  getMyTransactions,
  getTransactionById,
  createTransaction,
  exportTransactions,
  getTransactionStats,
  getTransactionsByType
};
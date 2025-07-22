import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/apiService';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wallet balance from API
  const fetchWalletBalance = useCallback(async (period = 'weekly') => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get(`/payments/stats?period=${period}`);
      if (typeof res.data.walletBalance === 'number') {
        setWalletBalance(res.data.walletBalance);
      } else {
        setWalletBalance(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch wallet balance');
      setWalletBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optionally, fetch on mount
  // useEffect(() => { fetchWalletBalance(); }, [fetchWalletBalance]);

  return (
    <WalletContext.Provider value={{ walletBalance, setWalletBalance, fetchWalletBalance, loading, error }}>
      {children}
    </WalletContext.Provider>
  );
} 
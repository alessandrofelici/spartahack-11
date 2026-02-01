import { useState, useEffect } from 'react';

export const useSlippage = (token) => {
  const [data, setData] = useState({ slippage: 0.1, risk: 'low', loading: true });

  useEffect(() => {
    // Simulated API response while waiting for backend
    const interval = setInterval(() => {
      const mockSlippage = (Math.random() * 3).toFixed(2);
      let risk = 'low';
      if (mockSlippage > 0.5) risk = 'moderate';
      if (mockSlippage > 1.5) risk = 'severe';

      setData({ slippage: mockSlippage, risk, loading: false });
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  return data;
};
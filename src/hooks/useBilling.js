import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useBilling() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBilling = useCallback(async () => {
    try {
      const data = await api.get('/payments/me');
      setBilling(data);
    } catch {
      setBilling(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const checkout = async (plan) => {
    const data = await api.post('/payments/checkout', { plan });
    window.location.href = data.checkout_url;
  };

  const openPortal = async () => {
    const data = await api.post('/payments/portal');
    window.location.href = data.portal_url;
  };

  return { billing, loading, checkout, openPortal, refresh: fetchBilling };
}

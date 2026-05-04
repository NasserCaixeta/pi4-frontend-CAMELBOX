import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

function deriveAvailableMonths(transactions) {
  const monthSet = new Map();
  for (const tx of transactions) {
    const d = new Date(tx.date + 'T00:00:00');
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const key = `${year}-${month}`;
    if (!monthSet.has(key)) {
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const capitalLabel = label.charAt(0).toUpperCase() + label.slice(1);
      monthSet.set(key, { month, year, label: capitalLabel });
    }
  }
  return Array.from(monthSet.values()).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );
}

export default function useDashboard(month, year) {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [statements, setStatements] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First fetch statements to check if user has data
      const stmts = await api.get('/statements');
      setStatements(stmts);

      const hasCompleted = stmts.some((s) => s.status === 'completed');
      if (!hasCompleted) {
        setLoading(false);
        return;
      }

      // Fetch all transactions (no month filter) to derive available months
      const allTx = await api.get('/transactions?limit=100');
      const months = deriveAvailableMonths(allTx.items);
      setAvailableMonths(months);

      // If no month/year selected yet, only fetch availableMonths, skip dashboard data
      if (!month || !year) {
        setLoading(false);
        return;
      }

      // Fetch dashboard data in parallel
      const params = `?month=${month}&year=${year}`;
      const [summaryData, catData, txData] = await Promise.all([
        api.get(`/dashboard/summary${params}`).catch(() => null),
        api.get(`/dashboard/by-category${params}`).catch(() => null),
        api.get(`/transactions${params}&limit=100`).catch(() => null),
      ]);

      setSummary(summaryData);
      setCategories(catData);
      setTransactions(txData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    categories,
    transactions,
    statements,
    availableMonths,
    loading,
    error,
    refresh: fetchData,
  };
}

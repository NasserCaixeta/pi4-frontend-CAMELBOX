import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export default function useFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/feedback');
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchList]);

  const loadFeedback = useCallback(async (feedbackId) => {
    try {
      const data = await api.get(`/feedback/${feedbackId}`);
      setActiveFeedback(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const startPolling = useCallback((feedbackId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.get(`/feedback/${feedbackId}`);
        setActiveFeedback(data);
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setGenerating(false);
          fetchList();
        }
      } catch {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setGenerating(false);
      }
    }, 3000);
  }, [fetchList]);

  const generate = useCallback(async (month, year) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.post('/feedback/generate', { month, year });
      setActiveFeedback({ id: result.feedback_id, status: 'pending', month, year });
      startPolling(result.feedback_id);
      fetchList();
      return result;
    } catch (err) {
      setGenerating(false);
      throw err;
    }
  }, [startPolling, fetchList]);

  const deleteFeedback = useCallback(async (feedbackId) => {
    await api.delete(`/feedback/${feedbackId}`);
    if (activeFeedback?.id === feedbackId) setActiveFeedback(null);
    fetchList();
  }, [activeFeedback, fetchList]);

  return {
    feedbacks,
    activeFeedback,
    setActiveFeedback,
    loading,
    generating,
    error,
    generate,
    loadFeedback,
    deleteFeedback,
    refresh: fetchList,
  };
}

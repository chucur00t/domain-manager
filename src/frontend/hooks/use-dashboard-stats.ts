import { useState, useEffect } from 'react';

interface DashboardStats {
  timestamp: string;
  domainStats: {
    total: number;
    active: number;
    expired: number;
    pending: number;
  };
  hostingStats: {
    total: number;
    avg_storage: number;
    avg_bandwidth: number;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/dashboard/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
        } else {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to parse dashboard data');
      }
    };

    eventSource.onerror = () => {
      setError('Connection to dashboard lost');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { stats, error };
}
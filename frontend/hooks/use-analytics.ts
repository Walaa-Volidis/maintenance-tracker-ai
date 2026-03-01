'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { AnalyticsStats } from '@/types';

interface UseAnalyticsReturn {
  stats: AnalyticsStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get<AnalyticsStats>('/api/analytics/stats');
      setStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}

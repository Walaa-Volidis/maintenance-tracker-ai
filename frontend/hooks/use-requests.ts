'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { MaintenanceRequest, MaintenanceRequestCreate } from '@/types';

interface UseRequestsReturn {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createRequest: (
    data: MaintenanceRequestCreate,
  ) => Promise<MaintenanceRequest>;
}

export function useRequests(): UseRequestsReturn {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get<MaintenanceRequest[]>('/api/requests');
      setRequests(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch requests';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = useCallback(
    async (payload: MaintenanceRequestCreate): Promise<MaintenanceRequest> => {
      const { data } = await api.post<MaintenanceRequest>(
        '/api/requests',
        payload,
      );
      setRequests((prev) => [data, ...prev]);
      return data;
    },
    [],
  );

  return { requests, isLoading, error, refresh: fetchRequests, createRequest };
}

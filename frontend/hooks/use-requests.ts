'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type {
  MaintenanceRequest,
  MaintenanceRequestCreate,
  PaginatedResponse,
} from '@/types';

const PAGE_SIZE = 5;

interface UseRequestsReturn {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  createRequest: (
    data: MaintenanceRequestCreate,
  ) => Promise<MaintenanceRequest>;
}

export function useRequests(): UseRequestsReturn {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const skip = (page - 1) * PAGE_SIZE;
      const { data } = await api.get<PaginatedResponse>('/api/requests', {
        params: { skip, limit: PAGE_SIZE },
      });
      setRequests(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch requests';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = useCallback(
    async (payload: MaintenanceRequestCreate): Promise<MaintenanceRequest> => {
      const { data } = await api.post<MaintenanceRequest>(
        '/api/requests',
        payload,
      );
      // Go to page 1 to see the new record (newest first)
      setPage(1);
      await fetchRequests();
      return data;
    },
    [fetchRequests],
  );

  return {
    requests,
    isLoading,
    error,
    page,
    pages,
    total,
    setPage,
    refresh: fetchRequests,
    createRequest,
  };
}

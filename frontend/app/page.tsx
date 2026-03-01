'use client';

import { Loader2 } from 'lucide-react';

import { RequestForm } from '@/components/request-form';
import { RequestsTable } from '@/components/requests-table';
import { StatsCards } from '@/components/stats-cards';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAnalytics } from '@/hooks/use-analytics';
import { useRequests } from '@/hooks/use-requests';

export default function DashboardPage() {
  const { requests, isLoading, error, createRequest } = useRequests();
  const { stats, isLoading: statsLoading } = useAnalytics();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Maintenance Request Tracker
          </h1>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* ── Stats cards ── */}
        <div className="mb-8">
          <StatsCards stats={stats} isLoading={statsLoading} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* ── Create form ── */}
          <Card className="h-fit border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">New Request</CardTitle>
              <CardDescription className="text-slate-500">
                Submit a maintenance request — AI will auto-categorize it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestForm onSubmit={createRequest} />
            </CardContent>
          </Card>

          {/* ── Requests list ── */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">All Requests</CardTitle>
              <CardDescription className="text-slate-500">
                {requests.length}{' '}
                {requests.length === 1 ? 'request' : 'requests'} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-8 animate-spin text-slate-400" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-red-600">
                  <p className="text-lg font-medium">Failed to load</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              ) : (
                <RequestsTable requests={requests} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

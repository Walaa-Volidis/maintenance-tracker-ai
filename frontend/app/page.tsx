'use client';

import { Loader2 } from 'lucide-react';

import { RequestForm } from '@/components/request-form';
import { RequestsTable } from '@/components/requests-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRequests } from '@/hooks/use-requests';

export default function DashboardPage() {
  const { requests, isLoading, error, createRequest } = useRequests();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight">
            Maintenance Request Tracker
          </h1>
        </div>
      </header>

      {/* ── Main grid ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* ── Create form ── */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>New Request</CardTitle>
              <CardDescription>
                Submit a maintenance request — AI will auto-categorize it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestForm onSubmit={createRequest} />
            </CardContent>
          </Card>

          {/* ── Requests list ── */}
          <Card>
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>
                {requests.length}{' '}
                {requests.length === 1 ? 'request' : 'requests'} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-destructive">
                  <p className="text-lg font-medium">Failed to load</p>
                  <p className="text-sm">{error}</p>
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

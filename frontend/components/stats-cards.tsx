'use client';

import { AlertTriangle, ClipboardList, Sparkles, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyticsStats } from '@/types';

interface StatsCardsProps {
  stats: AnalyticsStats | null;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Requests',
      value: stats?.total_requests ?? 0,
      icon: ClipboardList,
      iconColor: 'text-indigo-500',
      bgAccent: '',
    },
    {
      title: 'Most Frequent Category',
      value: stats?.most_common_category ?? '—',
      icon: Sparkles,
      iconColor: 'text-emerald-500',
      bgAccent: 'bg-emerald-50 ring-1 ring-emerald-200/60',
    },
    {
      title: 'High Priority Issues',
      value: stats?.high_priority_count ?? 0,
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgAccent: '',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(({ title, value, icon: Icon, iconColor, bgAccent }) => (
        <Card
          key={title}
          className={`border-slate-200 shadow-sm ${bgAccent || 'bg-white'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {title}
            </CardTitle>
            <Icon className={`size-5 ${iconColor}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

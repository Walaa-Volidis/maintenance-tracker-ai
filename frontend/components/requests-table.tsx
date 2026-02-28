'use client';

import { Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MaintenanceRequest, Priority, Status } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Electrical:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  HVAC: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Furniture:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  General: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const STATUS_COLORS: Record<Status, string> = {
  Pending: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  'In Progress':
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Completed:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

interface RequestsTableProps {
  requests: MaintenanceRequest[];
}

export function RequestsTable({ requests }: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No requests yet</p>
        <p className="text-sm">
          Create your first maintenance request to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>AI Category</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Created</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {requests.map((req) => (
          <TableRow key={req.id}>
            {/* ID */}
            <TableCell className="font-medium">{req.id}</TableCell>

            {/* Title + AI Summary */}
            <TableCell className="max-w-xs">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    <p className="truncate font-medium">{req.title}</p>
                    {req.ai_summary && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="size-3 shrink-0 text-amber-500" />
                        {req.ai_summary}
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">{req.description}</p>
                </TooltipContent>
              </Tooltip>
            </TableCell>

            {/* AI Category */}
            <TableCell>
              <Badge
                variant="outline"
                className={
                  CATEGORY_COLORS[req.category ?? 'General'] ??
                  CATEGORY_COLORS.General
                }
              >
                {req.category ?? 'General'}
              </Badge>
            </TableCell>

            {/* Priority */}
            <TableCell>
              <Badge
                variant="outline"
                className={PRIORITY_COLORS[req.priority]}
              >
                {req.priority}
              </Badge>
            </TableCell>

            {/* Status */}
            <TableCell>
              <Badge variant="outline" className={STATUS_COLORS[req.status]}>
                {req.status}
              </Badge>
            </TableCell>

            {/* Created At */}
            <TableCell className="text-right text-muted-foreground">
              {new Date(req.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

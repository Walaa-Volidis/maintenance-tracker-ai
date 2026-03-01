'use client';

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Plumbing: 'border-sky-200 bg-sky-50 text-sky-800',
  Electrical: 'border-sky-200 bg-sky-50 text-sky-800',
  HVAC: 'border-sky-200 bg-sky-50 text-sky-800',
  Furniture: 'border-sky-200 bg-sky-50 text-sky-800',
  General: 'border-sky-200 bg-sky-50 text-sky-800',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Medium: 'border-amber-200 bg-amber-50 text-amber-800',
  High: 'border-red-200 bg-red-50 text-red-800',
};

const STATUS_COLORS: Record<Status, string> = {
  Pending: 'border-slate-200 bg-slate-50 text-slate-700',
  'In Progress': 'border-indigo-200 bg-indigo-50 text-indigo-800',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

interface RequestsTableProps {
  requests: MaintenanceRequest[];
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function RequestsTable({
  requests,
  page,
  pages,
  onPageChange,
}: RequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <p className="text-lg font-medium text-slate-500">No requests yet</p>
        <p className="text-sm">
          Create your first maintenance request to get started.
        </p>
      </div>
    );
  }

  return (
    <>
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
              <TableCell className="font-medium text-slate-900">
                {req.id}
              </TableCell>

              {/* Title + AI Summary */}
              <TableCell className="max-w-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-default">
                      <p className="truncate font-medium text-slate-900">
                        {req.title}
                      </p>
                      {req.ai_summary && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
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
              <TableCell className="text-right text-slate-500">
                {new Date(req.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ── Pagination controls ── */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-2 pt-4">
          <p className="text-sm text-slate-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

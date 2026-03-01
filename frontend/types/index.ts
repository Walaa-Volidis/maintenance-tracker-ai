export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'In Progress' | 'Completed';

export interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  category: string | null;
  ai_summary: string | null;
  priority: Priority;
  status: Status;
  created_at: string;
}

export interface MaintenanceRequestCreate {
  title: string;
  description: string;
  priority?: Priority;
  status?: Status;
}

export interface PaginatedResponse {
  items: MaintenanceRequest[];
  total: number;
  page: number;
  pages: number;
}

export interface AnalyticsStats {
  total_requests: number;
  most_common_category: string | null;
  high_priority_count: number;
}

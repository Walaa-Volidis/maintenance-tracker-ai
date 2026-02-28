export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'In Progress' | 'Completed';

export interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  category: string | null;
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

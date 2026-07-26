export type WeeklyType = 'current' | 'past';
export type TaskStatus = 'pending' | 'blocked' | 'done';
export type WeeklyStatus = 'planning' | 'in_progress' | 'closed';

export interface WeeklyTask {
  id: string;
  weekly_id: string;
  carried_over_from_id?: string;
  type: WeeklyType;
  status: TaskStatus;
  content: string;
  project_name?: string;
}

export interface Weekly {
  id: string;
  sector_member_id: string;
  status: WeeklyStatus;
  date_week: string;
  submitted_at: string;
  tasks?: WeeklyTask[];
}

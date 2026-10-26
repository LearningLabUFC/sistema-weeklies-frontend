import type { LucideIcon } from 'lucide-react';

export interface UserItem {
  id: string | number;
  name: string;
  role?: string;
  avatar?: string;
  weeksWithoutReport: number;
  projects: string[];
}

export interface ProjectItem {
  id: string | number;
  name: string;
  members: (string | number)[];
}

export interface PresenceItem {
  present: boolean;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  to: string;
}

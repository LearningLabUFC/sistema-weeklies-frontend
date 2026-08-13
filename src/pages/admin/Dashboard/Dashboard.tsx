import { useState } from 'react';
import Header from '@/components/Header/Header';
import { AlertSection } from '@/components/AlertSection/AlertSection';
import { EngagementSummaryCard } from '@/components/EngagementSummaryCard/EngagementSummaryCard';
import { ProjectsOverviewCard } from '@/components/ProjectsOverviewCard/ProjectsOverviewCard';
import { StatsGrid } from '@/components/StatsGrid/StatsGrid';
import { WeeklyStatusCard } from '@/components/WeeklyStatusCard/WeeklyStatusCard';

import {
  Users,
  AlertTriangle,
  TrendingUp,
  FolderKanban,
  CalendarCheck,
} from 'lucide-react';

import {
  MOCK_USERS,
  MOCK_PROJECTS,
  MOCK_PRESENCE_RECORDS,
} from '@/data/mockData';

import type {
  UserItem,
  ProjectItem,
  PresenceItem,
  StatCardProps,
} from '@/types/dashboard';

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const usersList: UserItem[] = (MOCK_USERS || []) as UserItem[];
  const projectsList: ProjectItem[] = (MOCK_PROJECTS || []) as ProjectItem[];
  const presenceList: PresenceItem[] = (MOCK_PRESENCE_RECORDS ||
    []) as PresenceItem[];

  const allStudents = usersList.filter(u => u.role !== 'admin');
  const alertStudents = allStudents.filter(s => s.weeksWithoutReport >= 3);
  const activeStudents = allStudents.filter(s => s.weeksWithoutReport < 3);

  const totalPresences = presenceList.filter(r => r.present).length;
  const presenceRate = Math.round(
    (totalPresences / (presenceList.length || 1)) * 100,
  );

  const submittedThisWeek = allStudents.filter(
    s => s.weeksWithoutReport === 0,
  ).length;
  const submissionRate = Math.round(
    (submittedThisWeek / (allStudents.length || 1)) * 100,
  );

  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats: StatCardProps[] = [
    {
      label: 'Total de alunos',
      value: allStudents.length,
      icon: Users,
      color:
        'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      to: '/admin/participantes',
    },
    {
      label: 'Alunos ativos',
      value: activeStudents.length,
      icon: TrendingUp,
      color:
        'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900/50',
      iconColor: 'text-green-600 dark:text-green-400',
      to: '/admin/participantes',
    },
    {
      label: 'Com Alerta',
      value: alertStudents.length,
      icon: AlertTriangle,
      color:
        'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50',
      iconColor: 'text-red-500 dark:text-red-400',
      to: '/admin/participantes',
    },
    {
      label: 'Projetos',
      value: projectsList.length,
      icon: FolderKanban,
      color:
        'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      to: '/admin/projetos',
    },
    {
      label: 'Taxa de presença',
      value: `${presenceRate}%`,
      icon: CalendarCheck,
      color:
        'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      to: '/admin/presenca',
    },
  ];

  return (
    <div className="w-full py-6 sm:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Dashboard"
        subtitle="Visão geral e monitoramento do LearningLab Weekly"
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <AlertSection alertStudents={alertStudents} />
          <WeeklyStatusCard
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredStudents={filteredStudents}
          />
        </div>

        <div className="space-y-6">
          <ProjectsOverviewCard projects={projectsList} users={usersList} />
          <EngagementSummaryCard
            presenceRate={presenceRate}
            submissionRate={submissionRate}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

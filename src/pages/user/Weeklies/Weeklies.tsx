import { useRef, useState } from 'react';

import Header from '@/components/layout/Header/Header';
import { ProjectCard } from '@/features/weeklies/components/ProjectCard';
import { WeeklyProgress } from '@/features/weeklies/components/WeeklyProgress';
import { WeeklySubmit } from '@/features/weeklies/components/WeeklySubmit';
import {
  MOCK_PROJECTS,
  type WeeklyProject,
  type WeeklyTask,
} from '@/mock/projects';

const getMonday = (date: Date, weeksAgo = 0) => {
  const monday = new Date(date);
  const day = monday.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - daysSinceMonday - weeksAgo * 7);
  return monday;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

const Weeklies = () => {
  const [projects, setProjects] = useState<WeeklyProject[]>(MOCK_PROJECTS);
  const [submitted, setSubmitted] = useState(false);
  const taskIdRef = useRef(0);
  const currentMonday = formatDate(getMonday(new Date()));
  const previousMonday = formatDate(getMonday(new Date(), 1));

  const filledCount = projects.filter(project =>
    project.nextWeekTasks.some(task => task.content.trim().length > 0),
  ).length;
  const canSubmit = projects.length > 0 && filledCount === projects.length;

  const updateProject = (
    projectId: string,
    changes: Partial<WeeklyProject>,
  ) => {
    setSubmitted(false);
    setProjects(currentProjects =>
      currentProjects.map(project =>
        project.id === projectId ? { ...project, ...changes } : project,
      ),
    );
  };

  const addTask = (
    projectId: string,
    section: 'lastWeekTasks' | 'nextWeekTasks',
  ) => {
    const taskId = taskIdRef.current++;
    const task: WeeklyTask = {
      id: `${projectId}-${section}-${taskId}`,
      content: '',
      completed: false,
      hasBlocker: false,
      blockerReason: '',
    };
    const project = projects.find(item => item.id === projectId);
    if (project) {
      updateProject(projectId, { [section]: [...project[section], task] });
    }
  };

  const updateTask = (
    projectId: string,
    section: 'lastWeekTasks' | 'nextWeekTasks',
    taskId: string,
    changes: Partial<WeeklyTask>,
  ) => {
    const project = projects.find(item => item.id === projectId);
    if (!project) return;
    updateProject(projectId, {
      [section]: project[section].map(task =>
        task.id === taskId ? { ...task, ...changes } : task,
      ),
    });
  };

  const removeTask = (
    projectId: string,
    section: 'lastWeekTasks' | 'nextWeekTasks',
    taskId: string,
  ) => {
    const project = projects.find(item => item.id === projectId);
    if (!project) return;
    updateProject(projectId, {
      [section]: project[section].filter(task => task.id !== taskId),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <Header
        title="Relatório de weeklies"
        subtitle="Registre suas atividades semanais nos seus projetos"
      />
      <form
        className="space-y-4"
        onSubmit={event => {
          event.preventDefault();
          if (canSubmit) setSubmitted(true);
        }}
      >
        <WeeklyProgress
          projects={projects}
          filledCount={filledCount}
          canSubmit={canSubmit}
        />

        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            previousMonday={previousMonday}
            currentMonday={currentMonday}
            onAddTask={section => addTask(project.id, section)}
            onUpdateTask={(section, taskId, changes) =>
              updateTask(project.id, section, taskId, changes)
            }
            onRemoveTask={(section, taskId) =>
              removeTask(project.id, section, taskId)
            }
          />
        ))}

        <WeeklySubmit submitted={submitted} canSubmit={canSubmit} />
      </form>
    </div>
  );
};

export default Weeklies;

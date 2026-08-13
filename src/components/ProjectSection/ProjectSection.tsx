import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProjectSectionProps {
  project: {
    name: string;
    past: string[];
    current: string[];
    blockers: string[];
  };
}

export const ProjectSection = ({ project }: ProjectSectionProps) => {
  return (
    <div>
      <Badge className="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 font-medium px-3 py-1">
        {project.name}
      </Badge>

      <div className="space-y-4">
        {project.past.length > 0 && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">
              O que fiz na semana passada
            </h4>
            <ul className="space-y-1">
              {project.past.map((content, idx) => (
                <li
                  key={idx}
                  className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                >
                  {content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.current.length > 0 && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">
              O que vou fazer nesta semana
            </h4>
            <ul className="space-y-1">
              {project.current.map((content, idx) => (
                <li
                  key={idx}
                  className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                >
                  {content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.blockers.length > 0 && (
          <Alert
            variant="destructive"
            className="mt-4 bg-destructive/10 dark:bg-destructive/15 border-destructive/30 text-destructive dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 stroke-destructive dark:stroke-red-400" />
            <AlertTitle className="font-semibold text-base">
              Impedimentos
            </AlertTitle>
            <AlertDescription className="mt-1">
              <ul className="space-y-1 list-disc list-inside text-sm text-destructive/90 dark:text-red-300">
                {project.blockers.map((blocker, idx) => (
                  <li key={idx} className="leading-normal">
                    {blocker}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

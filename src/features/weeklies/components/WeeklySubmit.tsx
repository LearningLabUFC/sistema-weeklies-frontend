import { CircleAlert, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';

interface WeeklySubmitProps {
  submitted: boolean;
  canSubmit: boolean;
}

export const WeeklySubmit = ({ submitted, canSubmit }: WeeklySubmitProps) => (
  <Card className="rounded-2xl border-transparent bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleAlert className="size-4" />
        {submitted
          ? 'Relatório enviado com sucesso.'
          : 'Cada projeto precisa de uma tarefa planejada.'}
      </p>
      <Button
        type="submit"
        disabled={!canSubmit}
        className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 sm:min-w-36"
      >
        <Send /> Enviar weeklies
      </Button>
    </CardFooter>
  </Card>
);

import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { WeeklyDetailView } from '@/features/weeklies/components/WeeklyDetailView';

export default function WeeklyDetailPage() {
  const { weeklyId } = useParams<{ weeklyId: string }>();
  const navigate = useNavigate();

  if (!weeklyId) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-muted-foreground">
          Identificador da weekly não informado.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/weeklies')}
          className="mt-4"
        >
          Voltar para minhas weeklies
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/weeklies')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para histórico</span>
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <WeeklyDetailView weeklyId={weeklyId} />
      </div>
    </div>
  );
}

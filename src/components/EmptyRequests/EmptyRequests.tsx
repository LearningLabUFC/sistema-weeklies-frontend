import { Inbox } from 'lucide-react';

export const EmptyRequests = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        Nenhuma solicitação pendente
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
        Todas as solicitações de acesso foram analisadas. Quando novos alunos se
        registrarem, eles aparecerão aqui.
      </p>
    </div>
  );
};

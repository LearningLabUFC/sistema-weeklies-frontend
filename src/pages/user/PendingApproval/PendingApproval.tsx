import { useEffect } from 'react';
import { Clock, LogOut } from 'lucide-react';

import { pendingApprovalLinks } from '@/data/data';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function PendingApproval() {
  const { logout, checkUserStatus } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      checkUserStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkUserStatus]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-1">
            <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              Conta em análise
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Sua conta foi registrada com sucesso e está{' '}
              <span className="text-amber-500 dark:text-amber-400 font-semibold">
                pendente de análise
              </span>
              . Aguarde a aprovação de um administrador para acessar o sistema.
            </p>
          </div>
        </div>

        {/* Seção de Links */}
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 px-1">
            Enquanto você aguarda, conheça mais:
          </h2>
          <div className="grid gap-2">
            {pendingApprovalLinks.map(link => {
              const Icon = link.icon;
              return (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                >
                  <div className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {link.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Rodapé / Botão de Sair */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full h-11 flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <LogOut size={18} />
            Sair e voltar ao login
          </Button>
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: { total: number; ativos: number; inativos: number };
  filterStatus: 'todos' | 'ativo' | 'inativo';
  setFilterStatus: (status: 'todos' | 'ativo' | 'inativo') => void;
}

export function StatsCards({
  stats,
  filterStatus,
  setFilterStatus,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-6">
      <button
        onClick={() => setFilterStatus('todos')}
        className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm text-left transition-all ${
          filterStatus === 'todos'
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-400/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.total}
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => setFilterStatus('ativo')}
        className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm text-left transition-all ${
          filterStatus === 'ativo'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 dark:ring-emerald-400/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Ativos
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.ativos}
            </p>
          </div>
        </div>
      </button>

      <button
        onClick={() => setFilterStatus('inativo')}
        className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm text-left transition-all ${
          filterStatus === 'inativo'
            ? 'border-rose-400 ring-2 ring-rose-400/20 dark:ring-rose-400/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Com Alerta
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.inativos}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  dentroDaJanela,
  formatDateCivil,
  formatTimestampFortaleza,
  isRejeitadaWithinGracePeriod,
  obterSemanaReferencia,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { WeeklyResponse } from '@/types/weeklies';

interface WeeklySubmissionBannerProps {
  weekly: WeeklyResponse;
  onReopen: () => Promise<void>;
  isReopening: boolean;
}

export function WeeklySubmissionBanner({
  weekly,
  onReopen,
  isReopening,
}: WeeklySubmissionBannerProps) {
  const { showAlertDialog } = useAlertDialog();
  const janelaAberta = dentroDaJanela();
  const semanaRef = obterSemanaReferencia();

  const handleReopenClick = () => {
    showAlertDialog({
      type: 'confirm',
      title: 'Reabrir Weekly',
      message:
        'Deseja reabrir este relatório semanal? Ele voltará ao status de Rascunho para você poder adicionar ou alterar tarefas antes do fechamento da janela.',
      confirmText: 'Reabrir',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        await onReopen();
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Banner de Status da Janela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Semana de referência:{' '}
            <strong>
              {formatDateCivil(weekly.semana_referencia || semanaRef)}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span
            className={`font-semibold ${
              janelaAberta
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            {janelaAberta
              ? 'Janela de submissão aberta (Sexta a Segunda 23:59)'
              : 'Janela de submissão fechada'}
          </span>
        </div>
      </div>

      {/* Alerta de REJEITADA com feedback e carência de 24h */}
      {weekly.status === 'REJEITADA' && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            Relatório Rejeitado pelo Líder
          </div>

          {weekly.observacao_lider && (
            <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs">
              <strong className="block text-slate-700 dark:text-slate-300 mb-1">
                Feedback / Motivo da rejeição:
              </strong>
              <p className="whitespace-pre-wrap">{weekly.observacao_lider}</p>
            </div>
          )}

          <div className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {isRejeitadaWithinGracePeriod(weekly.avaliada_em) ? (
              <span>
                Prazo de carência ativo de 24h a partir da avaliação (
                {formatTimestampFortaleza(weekly.avaliada_em)}). Ajuste suas
                tarefas e reenvie.
              </span>
            ) : (
              <span className="font-semibold">
                Prazo de carência de 24h expirado.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Alerta de EXPIRADA */}
      {weekly.status === 'EXPIRADA' && (
        <div className="p-4 rounded-xl border border-slate-300 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
            <Clock className="w-5 h-5 text-slate-500" />
            Weekly Expirada
          </div>
          <p>
            {weekly.detalhe_expiracao ||
              weekly.motivo_expiracao ||
              'Esta weekly expirou automaticamente por não ter sido enviada ou avaliada a tempo.'}
          </p>
        </div>
      )}

      {/* Alerta de ENVIADA com opção de reabrir */}
      {weekly.status === 'ENVIADA' && (
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-sky-950 dark:text-sky-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Relatório enviado para avaliação
            </div>
            <p className="text-sky-700 dark:text-sky-300">
              Enviado em {formatTimestampFortaleza(weekly.enviada_em)}.
              Aguardando avaliação do líder do setor.
            </p>
          </div>

          {janelaAberta && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReopenClick}
              disabled={isReopening}
              className="gap-1.5 border-sky-300 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300 shrink-0 self-start sm:self-auto"
            >
              {isReopening ? (
                <Spinner className="w-3.5 h-3.5" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Reabrir Weekly (W06)
            </Button>
          )}
        </div>
      )}

      {/* Alerta de APROVADA */}
      {weekly.status === 'APROVADA' && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm text-emerald-950 dark:text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Weekly Aprovada pelo Líder
          </div>
          <p className="text-emerald-700 dark:text-emerald-300">
            Avaliada em {formatTimestampFortaleza(weekly.avaliada_em)}.
            {weekly.observacao_lider &&
              ` Observação: ${weekly.observacao_lider}`}
          </p>
        </div>
      )}
    </div>
  );
}

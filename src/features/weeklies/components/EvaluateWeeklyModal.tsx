import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import {
  formatDateCivil,
  podeRejeitarWeekly,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import type { WeeklyResponse } from '@/types/weeklies';

interface EvaluateWeeklyModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyId: string;
  semanaReferencia: string;
  membroNome?: string | null;
  membroId: string;
  currentUserId?: string;
  onSuccess: (updatedWeekly?: WeeklyResponse) => void;
}

export function EvaluateWeeklyModal({
  isOpen,
  onClose,
  weeklyId,
  semanaReferencia,
  membroNome,
  membroId,
  currentUserId,
  onSuccess,
}: EvaluateWeeklyModalProps) {
  const { showAlertDialog } = useAlertDialog();
  const [decision, setDecision] = useState<'APROVADA' | 'REJEITADA'>(
    'APROVADA',
  );
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSelfEvaluation = Boolean(currentUserId && membroId === currentUserId);
  const canReject = podeRejeitarWeekly(semanaReferencia);

  const evaluateMutation = useAsyncMutation(
    async () => {
      if (isSelfEvaluation) {
        throw new Error('Você não pode avaliar seu próprio relatório semanal.');
      }

      const trimmedFeedback = feedback.trim();
      if (decision === 'REJEITADA' && !trimmedFeedback) {
        throw new Error(
          'O feedback da liderança é obrigatório ao rejeitar uma weekly.',
        );
      }

      if (decision === 'REJEITADA' && !canReject) {
        throw new Error(
          'O prazo para rejeitar este relatório encerrou (quarta-feira às 23:59:59).',
        );
      }

      return await weekliesApi.evaluate(weeklyId, {
        status: decision,
        observacao_lider: trimmedFeedback.length > 0 ? trimmedFeedback : null,
      });
    },
    {
      onSuccess: (updatedWeekly: WeeklyResponse) => {
        showAlertDialog({
          type: 'success',
          title:
            decision === 'APROVADA' ? 'Weekly Aprovada' : 'Weekly Rejeitada',
          message: `O relatório semanal foi avaliado como ${decision}.`,
        });
        onSuccess(updatedWeekly);
        onClose();
      },
      onError: err => {
        setErrorMessage(err.message);
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (decision === 'REJEITADA' && !feedback.trim()) {
      setErrorMessage(
        'O feedback da liderança é obrigatório ao rejeitar uma weekly.',
      );
      return;
    }
    evaluateMutation.execute();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Avaliar Relatório Semanal
          </DialogTitle>
          <DialogDescription className="text-xs">
            Semana de {formatDateCivil(semanaReferencia)} — Membro:{' '}
            <strong>{membroNome || membroId}</strong>
          </DialogDescription>
        </DialogHeader>

        {isSelfEvaluation ? (
          <div className="py-4 space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Autoavaliação bloqueada</AlertTitle>
              <AlertDescription className="text-xs">
                As regras do sistema impedem que um membro ou líder avalie a
                própria weekly. Outro líder do setor ou um administrador deve
                realizar esta avaliação.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Decisão de Avaliação *
              </Label>
              <RadioGroup
                value={decision}
                onValueChange={v => setDecision(v as 'APROVADA' | 'REJEITADA')}
                className="grid grid-cols-2 gap-3"
              >
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    decision === 'APROVADA'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  onClick={() => setDecision('APROVADA')}
                >
                  <RadioGroupItem value="APROVADA" id="radio-aprovada" />
                  <Label
                    htmlFor="radio-aprovada"
                    className="cursor-pointer text-xs font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aprovar</span>
                  </Label>
                </div>

                <div
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                    !canReject
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : decision === 'REJEITADA'
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 cursor-pointer'
                        : 'border-slate-200 dark:border-slate-800 cursor-pointer'
                  }`}
                  onClick={() => canReject && setDecision('REJEITADA')}
                >
                  <RadioGroupItem
                    value="REJEITADA"
                    id="radio-rejeitada"
                    disabled={!canReject}
                  />
                  <Label
                    htmlFor="radio-rejeitada"
                    className="cursor-pointer text-xs font-medium flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Rejeitar</span>
                  </Label>
                </div>
              </RadioGroup>

              {!canReject && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  A opção de rejeição fica indisponível após quarta-feira às
                  23:59:59 da semana de referência.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feedback-text" className="text-xs font-medium">
                Feedback da Liderança{' '}
                {decision === 'REJEITADA' ? '*' : '(Opcional)'}
              </Label>
              <Textarea
                id="feedback-text"
                placeholder={
                  decision === 'REJEITADA'
                    ? 'Descreva os motivos da rejeição e as correções necessárias (obrigatório)...'
                    : 'Deixe um comentário ou elogio sobre as entregas da semana...'
                }
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={4}
                className="rounded-xl text-xs resize-none"
              />
              {decision === 'REJEITADA' && (
                <p className="text-[11px] text-muted-foreground">
                  Ao rejeitar, o membro receberá o feedback e terá 24h para
                  reenviar o relatório corrigido.
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                {errorMessage}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl h-9 text-xs"
                disabled={evaluateMutation.isMutating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`rounded-xl h-9 text-xs text-white ${
                  decision === 'APROVADA'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
                disabled={evaluateMutation.isMutating}
              >
                {evaluateMutation.isMutating
                  ? 'Registrando...'
                  : decision === 'APROVADA'
                    ? 'Confirmar Aprovação'
                    : 'Confirmar Rejeição'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

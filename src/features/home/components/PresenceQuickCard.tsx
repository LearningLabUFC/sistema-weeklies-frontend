import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CheckSquare,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMockPresence } from '@/features/presence/mock/presenceMock';

export function PresenceQuickCard() {
  const {
    activeMeeting,
    recentHistory,
    stats,
    confirmPresence,
    toggleChamadaAberta,
    resetMock,
  } = useMockPresence();

  const [keyword, setKeyword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await confirmPresence(keyword);
      if (!result.ok) {
        setErrorMsg(result.error || 'Não foi possível confirmar a presença.');
      } else {
        setKeyword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Presença e Chamadas
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check-in rápido e reuniões recentes
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shrink-0"
        >
          {stats.taxaPercentual}% de presença
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-5 flex-1">
        {/* Bloco da chamada ativa */}
        {activeMeeting.jaConfirmou ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                  Presença confirmada hoje às {activeMeeting.confirmadaEm}
                </p>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80 truncate">
                  {activeMeeting.titulo}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetMock}
              className="h-7 px-2 text-[11px] text-emerald-800 hover:text-emerald-900 dark:text-emerald-300 shrink-0 gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Simular novamente
            </Button>
          </div>
        ) : activeMeeting.isChamadaAberta ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20 p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Chamada aberta: {activeMeeting.titulo}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">
                {activeMeeting.horario}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="text"
                aria-label="Palavra-chave da chamada"
                value={keyword}
                onChange={e => {
                  setKeyword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Digite a palavra-chave (ex: learninglab)"
                disabled={isSubmitting}
                className="h-9 text-xs bg-white dark:bg-slate-900"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs shrink-0"
              >
                Confirmar
              </Button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMsg}
              </p>
            )}
          </form>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              Nenhuma chamada aberta no momento
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleChamadaAberta}
              className="h-7 text-[11px]"
            >
              Simular chamada aberta
            </Button>
          </div>
        )}

        {/* Últimas 3 reuniões */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Últimas reuniões
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {recentHistory.map(meeting => {
              const isPresent = meeting.status === 'PRESENTE';
              return (
                <div
                  key={meeting.id}
                  data-testid="presence-recent-item"
                  className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/50"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {meeting.titulo}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {meeting.data}
                    </p>
                  </div>

                  {isPresent ? (
                    <Badge
                      variant="outline"
                      className="text-[11px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Presente
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[11px] gap-1 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shrink-0"
                    >
                      <XCircle className="w-3 h-3" />
                      Ausente
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/40">
        <Link
          to="/presenca"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1"
        >
          Ver histórico de chamadas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}

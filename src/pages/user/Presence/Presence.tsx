import { Calendar, CheckCircle2, Clock, History, XCircle } from 'lucide-react';

import Header from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusCard from '@/features/presence/components/StatusCard';
import SuccessCard from '@/features/presence/components/SuccessCard';
import PresenceForm from '@/features/presence/form/PresenceForm';
import { useMockPresence } from '@/features/presence/mock/presenceMock';

const Presence = () => {
  const {
    activeMeeting,
    history,
    stats,
    confirmPresence,
    toggleChamadaAberta,
    resetMock,
  } = useMockPresence();

  const confirmationDate = activeMeeting.confirmadaDataIso
    ? new Date(activeMeeting.confirmadaDataIso)
    : null;

  const handleSuccess = (date: Date) => {
    void confirmPresence('learninglab', date);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Header
          title="Presença"
          subtitle="Confirme sua presença na reunião ativa e acompanhe seu histórico de chamadas"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={activeMeeting.jaConfirmou ? resetMock : toggleChamadaAberta}
          className="text-xs shrink-0 self-start sm:self-auto"
        >
          {activeMeeting.jaConfirmou
            ? 'Resetar demonstração'
            : activeMeeting.isChamadaAberta
              ? 'Simular chamada encerrada'
              : 'Simular chamada aberta'}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {activeMeeting.jaConfirmou ? (
          <SuccessCard confirmationDate={confirmationDate} />
        ) : (
          <>
            <StatusCard isPresenceActive={activeMeeting.isChamadaAberta} />
            <PresenceForm
              isPresenceActive={activeMeeting.isChamadaAberta}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </div>

      {/* Histórico de Reuniões e Chamadas (Demonstração Mockada) */}
      <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Histórico de Reuniões e Chamadas
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualização demonstrativa enquanto o backend de presença está em
              desenvolvimento.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="secondary"
              className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              Taxa de presença: {stats.taxaPercentual}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              {stats.totalPresencas} de {stats.totalReunioes} reuniões
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {history.map(meeting => {
            const isPresent = meeting.status === 'PRESENTE';
            return (
              <div
                key={meeting.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {meeting.titulo}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {meeting.data}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {meeting.horario}
                    </span>
                    {isPresent && meeting.confirmadaEm && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Confirmada às {meeting.confirmadaEm}
                      </span>
                    )}
                  </div>
                </div>

                {isPresent ? (
                  <Badge className="w-fit gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Presente
                  </Badge>
                ) : (
                  <Badge className="w-fit gap-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                    <XCircle className="w-3.5 h-3.5" />
                    Ausente
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Presence;

import { useState } from 'react';

import Header from '@/components/layout/Header/Header';
import { SessionHistoryCollapsible } from '@/features/workSession/components/SessionHistoryCollapsible';
import { SessionSummaryCollapsible } from '@/features/workSession/components/SessionSummaryCollapsible';
import { TimeClockTracker } from '@/features/workSession/components/TimeClockTracker';

const TimeClock = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSessionEnded = () => {
    // Incrementa trigger para atualizar reativamente o histórico e o resumo de horas
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Controle de horas"
        subtitle="Registre seu tempo de dedicação aos projetos"
      />
      <TimeClockTracker onSessionEnded={handleSessionEnded} />
      <SessionSummaryCollapsible refreshTrigger={refreshTrigger} />
      <SessionHistoryCollapsible refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default TimeClock;

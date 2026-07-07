import { useState } from 'react';

import PresenceForm from '@/components/forms/PresenceForm';
import PresenceStatusCard from '@/components/PresenceStatusCard/PresenceStatusCard';
import PresenceSuccessCard from '@/components/PresenceSuccessCard/PresenceSuccessCard';

type PresenceStatus = 'encerrada' | 'ativa' | 'confirmada';

const Presence = () => {
  // pra mudar a apresença é aqui nesse use state
  const [status, setStatus] = useState<PresenceStatus>('encerrada');
  const [confirmationDate, setConfirmationDate] = useState<Date | null>(null);

  const handleSuccess = (date: Date) => {
    setConfirmationDate(date);
    setStatus('confirmada');
  };

  const isPresenceActive = status === 'ativa';

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Presença
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Confirme sua presença digitando a palavra informada na reunião
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {status === 'confirmada' ? (
          <PresenceSuccessCard confirmationDate={confirmationDate} />
        ) : (
          <>
            <PresenceStatusCard isPresenceActive={isPresenceActive} />
            <PresenceForm
              isPresenceActive={isPresenceActive}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Presence;

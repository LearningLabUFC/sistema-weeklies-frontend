import { useState } from 'react';

import PresenceForm from '@/components/forms/PresenceForm';
import PresenceStatusCard from '@/components/PresenceStatusCard/PresenceStatusCard';
import PresenceSuccessCard from '@/components/PresenceSuccessCard/PresenceSuccessCard';
import Header from '@/components/Header/Header';

type PresenceStatus = 'encerrada' | 'ativa' | 'confirmada';

const Presence = () => {
  const [status, setStatus] = useState<PresenceStatus>('encerrada');
  const [confirmationDate, setConfirmationDate] = useState<Date | null>(null);

  const handleSuccess = (date: Date) => {
    setConfirmationDate(date);
    setStatus('confirmada');
  };

  const isPresenceActive = status === 'encerrada';

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Presença"
        subtitle="Confirme sua presença digitando a palavra informada na reunião"
      />

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

import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PresenceSuccessCardProps {
  confirmationDate: Date | null;
}

const PresenceSuccessCard = ({
  confirmationDate,
}: PresenceSuccessCardProps) => {
  return (
    <Card className="rounded-2xl shadow-sm border border-green-200 bg-green-50 overflow-hidden animate-in zoom-in-95 duration-300">
      <CardContent className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-white p-3 rounded-full shadow-sm">
          <CheckCircle2
            className="w-10 h-10 sm:w-12 sm:h-12 text-green-500"
            strokeWidth={2.5}
          />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-1">
            Presença confirmada!
          </h2>
          <p className="text-sm sm:text-base text-green-700">
            Sua presença já foi registrada nesta sessão.
          </p>

          {confirmationDate && (
            <p className="text-xs sm:text-sm text-green-600 mt-4 font-medium bg-green-100/50 inline-block px-4 py-1.5 rounded-full">
              Registrado em: {confirmationDate.toLocaleDateString('pt-BR')} às{' '}
              {confirmationDate.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PresenceSuccessCard;

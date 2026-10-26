import { zodResolver } from '@hookform/resolvers/zod';
import { Key } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const presenceSchema = z.object({
  keyword: z.string().min(1, 'A palavra-chave é obrigatória'),
});

type PresenceFormValues = z.infer<typeof presenceSchema>;

interface PresenceFormProps {
  isPresenceActive: boolean;
  onSuccess: (date: Date) => void;
}

const PresenceForm = ({ isPresenceActive, onSuccess }: PresenceFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PresenceFormValues>({
    resolver: zodResolver(presenceSchema),
  });

  const onSubmit = async (data: PresenceFormValues) => {
    setIsLoading(true);

    setTimeout(() => {
      if (data.keyword.toLowerCase() !== 'learninglab') {
        setError('keyword', {
          type: 'manual',
          message: 'Palavra incorreta. Tente novamente.',
        });
        setIsLoading(false);
      } else {
        onSuccess(new Date());
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <Card className="rounded-2xl shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
            Confirmar presença
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="keyword"
              className="font-semibold text-sm text-slate-900 dark:text-slate-200"
            >
              Palavra-chave
            </Label>
            <Input
              id="keyword"
              type="text"
              disabled={!isPresenceActive || isLoading}
              placeholder="Digite a palavra informada na reunião"
              className={`bg-slate-50 dark:bg-slate-950 border-transparent focus-visible:ring-offset-0 focus-visible:bg-white dark:focus-visible:bg-slate-900 text-slate-900 dark:text-slate-50 h-11 sm:h-12 text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.keyword
                  ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                  : 'focus-visible:ring-indigo-600'
              }`}
              {...register('keyword')}
            />
            {errors.keyword && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                {errors.keyword.message}
              </p>
            )}
          </div>

          {!isPresenceActive && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 px-4">
              A presença está encerrada no momento. Aguarde o administrador
              ativar uma nova sessão.
            </p>
          )}

          <Button
            type="submit"
            disabled={!isPresenceActive || isLoading}
            className="w-full h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar presença'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PresenceForm;

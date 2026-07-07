import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AxiosError } from 'axios';

import InputGroup from '@/components/InputGroup/InputGroup';
import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/context/AlertDialogContext';
import { api } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.email('Digite um endereço de email válido'),
});

type forgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<forgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: forgotPasswordValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      onSuccess();
    } catch (error) {
      let errorMessage =
        'Não foi possível enviar o link de recuperação. Tente novamente mais tarde.';

      if (error instanceof AxiosError) {
        const apiMessage = error.response?.data?.mensagem;
        const apiDetail = error.response?.data?.detail;

        if (apiMessage) {
          errorMessage = apiMessage;
        } else if (Array.isArray(apiDetail) && apiDetail[0]?.msg) {
          errorMessage = apiDetail[0].msg;
        } else if (typeof apiDetail === 'string') {
          errorMessage = apiDetail;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showAlertDialog({
        type: 'error',
        title: 'Erro na Recuperação',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputGroup
        id="email"
        label="Email"
        type="email"
        placeholder="seu.email@exemplo.com"
        registration={register('email')}
        error={errors.email?.message}
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white h-11 sm:h-12 rounded-lg text-sm sm:text-base transition-colors disabled:opacity-70 mt-2"
      >
        {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
      </Button>

      <Button
        type="button"
        onClick={() => navigate('/login')}
        disabled={isLoading}
        className="w-full cursor-pointer bg-transparent hover:bg-transparent text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:underline mt-2 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para a Tela de Login
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;

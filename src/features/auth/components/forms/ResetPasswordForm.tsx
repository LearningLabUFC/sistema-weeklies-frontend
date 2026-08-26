import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { api } from '@/lib/api';

const resetSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

type ResetPasswordValues = z.infer<typeof resetSchema>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordForm = ({
  token,
  onSuccess,
}: ResetPasswordFormProps) => {
  const { showAlertDialog } = useAlertDialog();
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token_redefinicao: token,
        nova_senha: data.password,
      });

      onSuccess();
    } catch (error) {
      let errorMessage = 'Não foi possível redefinir a senha. Tente novamente.';

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
      }

      showAlertDialog({
        type: 'error',
        title: 'Erro na Redefinição',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="font-semibold text-sm text-slate-900 dark:text-slate-200"
        >
          Nova Senha
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua nova senha segura"
            className={`bg-slate-100 dark:bg-slate-900 border-transparent pr-10 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white dark:focus-visible:bg-slate-950 text-slate-900 dark:text-slate-50 h-11 ${
              errors.password
                ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                : ''
            }`}
            {...register('password')}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="font-semibold text-sm text-slate-900 dark:text-slate-200"
        >
          Confirmar Nova Senha
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repita a nova senha"
            className={`bg-slate-100 dark:bg-slate-900 border-transparent pr-10 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white dark:focus-visible:bg-slate-950 text-slate-900 dark:text-slate-50 h-11 ${
              errors.confirmPassword
                ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                : ''
            }`}
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white h-11 sm:h-12 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-70 mt-4"
      >
        {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
      </Button>
    </form>
  );
};

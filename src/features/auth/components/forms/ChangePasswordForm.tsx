import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import InputGroup from '@/components/shared/InputGroup/InputGroup';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { api } from '@/lib/api';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/`~]).{8,}$/;

const changePasswordSchema = z
  .object({
    senha_atual: z.string().min(1, 'A senha atual é obrigatória'),
    nova_senha: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(
        passwordRegex,
        'A senha deve conter letra maiúscula, minúscula, número e caractere especial.',
      ),
    confirmar_senha: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine(data => data.nova_senha === data.confirmar_senha, {
    message: 'As senhas não coincidem.',
    path: ['confirmar_senha'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePasswordForm = () => {
  const { showAlertDialog } = useAlertDialog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await api.put('/auth/change-password', {
        senha_atual: data.senha_atual,
        nova_senha: data.nova_senha,
      });

      showAlertDialog({
        type: 'success',
        title: 'Senha alterada',
        message: 'Sua senha foi alterada com sucesso.',
      });

      reset();
    } catch (error: unknown) {
      let errorMessage = 'Ocorreu um erro ao alterar a senha.';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.mensagem || errorMessage;
      }

      showAlertDialog({
        type: 'error',
        title: 'Erro ao alterar senha',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Alterar senha
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputGroup
            id="senha_atual"
            label="Senha atual"
            type="password"
            placeholder="••••••••"
            registration={register('senha_atual')}
            error={errors.senha_atual?.message}
            disabled={isSubmitting}
          />

          <InputGroup
            id="nova_senha"
            label="Nova senha"
            type="password"
            placeholder="••••••••"
            registration={register('nova_senha')}
            error={errors.nova_senha?.message}
            disabled={isSubmitting}
          />

          <InputGroup
            id="confirmar_senha"
            label="Confirmar nova senha"
            type="password"
            placeholder="••••••••"
            registration={register('confirmar_senha')}
            error={errors.confirmar_senha?.message}
            disabled={isSubmitting}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white min-w-40"
            >
              {isSubmitting ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;

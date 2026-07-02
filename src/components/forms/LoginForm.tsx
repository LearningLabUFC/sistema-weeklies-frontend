import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';
import InputGroup from '@/components/InputGroup/InputGroup';

const loginSchema = z.object({
  email: z
    .email('Digite um endereço de email válido')
    .min(1, 'O email é obrigatório'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        showAlertDialog({
          type: 'error',
          title: 'Falha no Login',
          message: error.message,
        });
      } else {
        showAlertDialog({
          type: 'error',
          title: 'Erro Inesperado',
          message: 'Ocorreu um erro inesperado ao fazer login.',
        });
      }
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

      <InputGroup
        id="password"
        label="Senha"
        type="password"
        placeholder="••••••••"
        registration={register('password')}
        error={errors.password?.message}
        disabled={isLoading}
      />

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-xs sm:text-sm text-indigo-500 hover:text-indigo-600 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white h-11 sm:h-12 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-70"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>

      <div className="text-center text-xs sm:text-sm text-slate-500 pt-2">
        Não tem uma conta?{' '}
        <Link
          to="/register"
          className="text-indigo-500 hover:text-indigo-600 hover:underline font-medium"
        >
          Registre-se
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;

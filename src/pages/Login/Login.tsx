import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { images } from '@/assets/images';

import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';

const loginSchema = z.object({
  email: z
    .email('Digite um endereço de email válido')
    .min(1, 'O email é obrigatório'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
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
    <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 flex flex-col items-center justify-center font-sans text-slate-900">
      <figure className="flex flex-col items-center mb-6 sm:mb-8 text-center">
        <div className="bg-indigo-600 flex items-center justify-center rounded-xl mb-3 shadow-sm p-3">
          <img
            src={images.white_logo}
            alt="Logo do Learninglab"
            className="h-12 w-12 sm:h-14 sm:w-14"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">
          LearningLab
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">Weekly Reports</p>
      </figure>

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-120 shadow-sm border-transparent bg-white rounded-2xl">
        <CardHeader className="text-center py-5 sm:py-6">
          <CardTitle className="text-2xl sm:text-3xl font-semibold">
            Bem-vindo de volta
          </CardTitle>
        </CardHeader>

        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-11 ${
                  errors.email
                    ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-11 ${
                  errors.password
                    ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <a
                href="forgot-password"
                className="text-xs sm:text-sm text-indigo-500 hover:text-indigo-600 hover:underline"
              >
                Esqueci minha senha
              </a>
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
              <a
                href="register"
                className="text-indigo-500 hover:text-indigo-600 hover:underline font-medium"
              >
                Registre-se
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

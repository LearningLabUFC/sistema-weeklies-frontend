import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { images } from '@/assets/images';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';

const registerSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório'),
  email: z.email('Digite um endereço de email válido'),
  password: z.string().min(8, 'A senha deve conter no mínimo 8 caracteres'),
  matricula: z.string().min(6, 'A matrícula deve ter no mínimo 6 dígitos'),
  birth: z.string().min(1, 'A data de nascimento é obrigatória'),
  curso: z.string().min(1, 'Selecione um curso'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser({
        nome_completo: data.fullName,
        email: data.email,
        senha: data.password,
        matricula: data.matricula,
        data_nascimento: data.birth,
        curso_id: data.curso,
        metas_horas_semanais: 12,
      });
      navigate('/', { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        showAlertDialog({
          type: 'error',
          title: 'Erro no Cadastro',
          message: error.message,
        });
      } else {
        showAlertDialog({
          type: 'error',
          title: 'Erro Inesperado',
          message: 'Ocorreu um erro ao processar seu cadastro.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 sm:px-8 py-4 bg-linear-to-br from-indigo-100 via-white to-indigo-100 flex flex-col items-center justify-center font-sans text-slate-900">
      <figure className="flex flex-col items-center mb-4 sm:mb-6 text-center">
        <div className="bg-indigo-600 flex items-center justify-center rounded-xl mb-2 shadow-sm p-2.5">
          <img
            src={images.white_logo}
            alt="Logo do Learninglab"
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
        </div>
        <h1 className="text-2xl font-bold text-indigo-600 mb-0.5">
          LearningLab
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">Crie sua Conta</p>
      </figure>

      <Card className="w-full max-w-sm sm:max-w-md shadow-sm border-transparent bg-white rounded-2xl">
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="fullName"
                className="font-semibold text-xs sm:text-sm"
              >
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu Nome Completo"
                className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-10 text-sm ${
                  errors.fullName
                    ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                disabled={isLoading}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="font-semibold text-xs sm:text-sm"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-10 text-sm ${
                  errors.email
                    ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="font-semibold text-xs sm:text-sm"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-10 text-sm ${
                  errors.password
                    ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="matricula"
                  className="font-semibold text-xs sm:text-sm"
                >
                  Número da Matrícula
                </Label>
                <Input
                  id="matricula"
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  placeholder="Ex: 123456"
                  className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-10 text-sm ${
                    errors.matricula
                      ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  disabled={isLoading}
                  {...register('matricula')}
                  onInput={e => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /\D/g,
                      '',
                    );
                  }}
                />
                {errors.matricula && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.matricula.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="birth"
                  className="font-semibold text-xs sm:text-sm"
                >
                  Data de Nascimento
                </Label>
                <Input
                  id="birth"
                  type="date"
                  className={`bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-10 text-sm ${
                    errors.birth
                      ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  disabled={isLoading}
                  {...register('birth')}
                />
                {errors.birth && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.birth.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="curso"
                className="font-semibold text-xs sm:text-sm"
              >
                Curso
              </Label>
              <Controller
                control={control}
                name="curso"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={`w-full bg-slate-100 border-transparent focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white h-10 text-sm ${
                        errors.curso
                          ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    >
                      <SelectValue placeholder="Selecione seu curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3fa85f64-5717-4562-b3fc-2c963f66afa6">
                        Ciência da Computação
                      </SelectItem>
                      <SelectItem value="es">Engenharia de Software</SelectItem>
                      <SelectItem value="ep">Engenharia de Produção</SelectItem>
                      <SelectItem value="ec">Engenharia Civil</SelectItem>
                      <SelectItem value="em">Engenharia Mecânica</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.curso && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.curso.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>

            <div className="text-center text-xs sm:text-sm text-slate-500 pt-1">
              Já possui uma conta?{' '}
              <a
                href="login"
                className="text-indigo-500 hover:text-indigo-600 hover:underline font-medium"
              >
                Faça Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';
import InputGroup from '@/components/InputGroup/InputGroup';

const registerSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório'),
  email: z.email('Digite um endereço de email válido'),
  password: z.string().min(8, 'A senha deve conter no mínimo 8 caracteres'),
  matricula: z.string().min(6, 'A matrícula deve ter no mínimo 6 dígitos'),
  birth: z.string().min(1, 'A data de nascimento é obrigatória'),
  curso: z.string().min(1, 'Selecione um curso'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <InputGroup
        id="fullName"
        label="Nome Completo"
        type="text"
        placeholder="Seu Nome Completo"
        registration={register('fullName')}
        error={errors.fullName?.message}
        disabled={isLoading}
      />

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputGroup
          id="matricula"
          label="Número da Matrícula"
          type="text"
          inputMode="numeric"
          maxLength={7}
          placeholder="Ex: 123456"
          registration={register('matricula')}
          error={errors.matricula?.message}
          disabled={isLoading}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
          }}
        />

        <InputGroup
          id="birth"
          label="Data de Nascimento"
          type="date"
          registration={register('birth')}
          error={errors.birth?.message}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="curso" className="font-semibold text-xs sm:text-sm">
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
        <Link
          to="/login"
          className="text-indigo-500 hover:text-indigo-600 hover:underline font-medium"
        >
          Faça Login
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;

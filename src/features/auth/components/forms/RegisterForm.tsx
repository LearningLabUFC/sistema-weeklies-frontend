import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import InputGroup from '@/components/shared/InputGroup/InputGroup';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatName } from '@/utils/formatName';

interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface Curso {
  id: string;
  nome: string;
  ativo: boolean;
}

const registerSchema = z.object({
  fullName: z.string().min(3, 'O nome completo é obrigatório'),
  email: z.email('Digite um endereço de email válido'),
  password: z
    .string()
    .min(8, 'Mínimo de 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial'),
  matricula: z.string().min(6, 'A matrícula deve ter no mínimo 6 dígitos'),
  birth: z.string().min(1, 'A data de nascimento é obrigatória'),
  curso: z
    .string({ message: 'Selecione um curso' })
    .min(1, 'Selecione um curso'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCursos, setLoadingCursos] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      curso: '',
    },
  });

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await api.get<Curso[]>('/domain/cursos');
        const cursosAtivos = response.data.filter(curso => curso.ativo);
        setCursos(cursosAtivos);
      } catch {
        showAlertDialog({
          type: 'error',
          title: 'Erro de carregamento',
          message: 'Não foi possível carregar a lista de cursos.',
        });
      } finally {
        setLoadingCursos(false);
      }
    };

    fetchCursos();
  }, [showAlertDialog]);

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
        meta_horas_semanais: 12,
      });
      navigate('/', { replace: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error.cause as AxiosError<{
          detail: FastAPIValidationError[];
        }>;

        if (
          axiosError?.response?.data?.detail &&
          Array.isArray(axiosError.response.data.detail)
        ) {
          const backendErrors = axiosError.response.data.detail;
          let mappedFieldError = false;

          backendErrors.forEach(err => {
            const backendField = String(err.loc[err.loc.length - 1]);
            const errorMessage = err.msg.replace('Value error, ', '');

            const fieldMap: Record<string, keyof RegisterFormValues> = {
              senha: 'password',
              nome_completo: 'fullName',
              email: 'email',
              matricula: 'matricula',
              data_nascimento: 'birth',
              curso_id: 'curso',
            };

            const formField = fieldMap[backendField];

            if (formField) {
              setError(formField, {
                type: 'server',
                message: errorMessage,
              });
              mappedFieldError = true;
            }
          });

          if (mappedFieldError) {
            setIsLoading(false);
            return;
          }
        }

        if (error.message.toLowerCase().includes('matrícula')) {
          setError('matricula', {
            type: 'manual',
            message: error.message,
          });
        } else {
          showAlertDialog({
            type: 'error',
            title: 'Erro no cadastro',
            message: error.message,
          });
        }
      } else {
        showAlertDialog({
          type: 'error',
          title: 'Erro inesperado',
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
        label="Nome completo"
        type="text"
        placeholder="Seu nome completo"
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

      <div className="space-y-1">
        <InputGroup
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          registration={register('password')}
          error={errors.password?.message}
          disabled={isLoading}
        />
        <div className="pl-1 pt-1">
          <ul className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 list-disc list-inside space-y-0.5">
            <li>Mínimo de 8 caracteres</li>
            <li>Letras maiúsculas e minúsculas</li>
            <li>Pelo menos um número e caractere especial (ex: !@#$%)</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputGroup
          id="matricula"
          label="Número da matrícula"
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
          label="Data de nascimento"
          type="date"
          registration={register('birth')}
          error={errors.birth?.message}
          disabled={isLoading}
          className="h-11 dark:scheme-dark"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="curso"
          className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-200"
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
              disabled={isLoading || loadingCursos}
            >
              <SelectTrigger
                className={`w-full bg-slate-100 dark:bg-slate-900 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 focus-visible:bg-white dark:focus-visible:bg-slate-950 h-11! text-sm ${
                  errors.curso
                    ? 'ring-2 ring-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
              >
                <SelectValue
                  placeholder={
                    loadingCursos
                      ? 'Carregando cursos...'
                      : 'Selecione seu curso'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cursos.map(curso => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {formatName(curso.nome)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.curso && (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium">
            {errors.curso.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white h-10 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-70"
      >
        {isLoading ? 'Registrando...' : 'Registrar'}
      </Button>

      <div className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-1">
        Já possui uma conta?{' '}
        <Link
          to="/login"
          className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline font-medium"
        >
          Faça login
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;

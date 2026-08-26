import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { CalendarDays, Clock, Mail, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Header from '@/components/layout/Header/Header';
import InputGroup from '@/components/shared/InputGroup/InputGroup';
import { ThemeToggle } from '@/components/shared/ThemeToggle/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { images } from '@/config/images';
import { ROLE_LABELS } from '@/config/roles';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  matricula: string;
  data_nascimento: string;
  data_ingresso: string;
  meta_horas_semanais: number;
  foto_perfil: string;
  curso_id: string;
  status_id: string;
  global_role: string;
  setores: string[];
}

interface UpdateProfilePayload {
  nome_completo: string;
  email: string;
  foto_perfil: string;
  senha?: string;
}

const profileSchema = z.object({
  nome_completo: z.string().min(1, 'O nome é obrigatório'),
  email: z.email('Digite um email válido'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .optional()
    .or(z.literal('')),
  foto_perfil: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { showAlertDialog } = useAlertDialog();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        const userData = response.data.usuario;
        setProfileData(userData);

        setValue('nome_completo', userData.nome_completo);
        setValue('email', userData.email);
      } catch {
        showAlertDialog({
          type: 'error',
          title: 'Erro ao carregar perfil',
          message: 'Não foi possível buscar suas informações.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setValue, showAlertDialog]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      let nomeArquivoFoto = profileData?.foto_perfil || 'avatar_padrao.png';
      if (data.foto_perfil && data.foto_perfil.length > 0) {
        const file = data.foto_perfil[0];
        nomeArquivoFoto = file.name;
      }

      const payload: UpdateProfilePayload = {
        nome_completo: data.nome_completo,
        email: data.email,
        foto_perfil: nomeArquivoFoto,
      };

      if (data.senha) {
        payload.senha = data.senha;
      }

      const response = await api.put('/users/me', payload);
      setProfileData(response.data.usuario);
      setIsEditing(false);

      showAlertDialog({
        type: 'success',
        title: 'Sucesso',
        message: 'Seu perfil foi atualizado com sucesso.',
      });
    } catch (error: unknown) {
      let errorMessage = 'Ocorreu um erro ao atualizar o perfil.';

      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.mensagem || errorMessage;
      }

      showAlertDialog({
        type: 'error',
        title: 'Erro ao salvar',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !profileData) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <Skeleton className="h-100 w-full rounded-2xl" />
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[profileData.global_role] || 'Aluno';

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between">
        <Header
          title="Perfil"
          subtitle="Gerencie suas informações pessoais e credenciais"
        />
        <ThemeToggle />
      </div>

      <Card className="rounded-2xl shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {!isEditing ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <img
                  src={
                    profileData.foto_perfil !== 'avatar_padrao.png'
                      ? profileData.foto_perfil
                      : images.default_profile
                  }
                  alt={profileData.nome_completo}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-950 shadow-sm"
                />

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {profileData.nome_completo}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30 pointer-events-none"
                    >
                      {roleLabel}
                    </Badge>
                    {profileData?.setores?.map(sector => (
                      <Badge
                        key={sector}
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/30 pointer-events-none"
                      >
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950 mt-4 sm:mt-0"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar perfil
                </Button>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </span>
                  <p className="text-slate-900 dark:text-slate-200 font-medium">
                    {profileData.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Data de ingresso
                  </span>
                  <p className="text-slate-900 dark:text-slate-200 font-medium">
                    {formatDate(profileData.data_ingresso)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Meta semanal
                  </span>
                  <p className="text-slate-900 dark:text-slate-200 font-medium">
                    {profileData.meta_horas_semanais} horas
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6">
                Editar perfil
              </h2>

              <InputGroup
                id="foto_perfil"
                label="Foto de Perfil"
                type="file"
                accept="image/*"
                registration={register('foto_perfil')}
                error={errors.foto_perfil?.message as string}
                disabled={isSubmitting}
                className="file:mr-4 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50 cursor-pointer h-auto py-2"
              />

              <InputGroup
                id="nome_completo"
                label="Nome completo"
                type="text"
                registration={register('nome_completo')}
                error={errors.nome_completo?.message}
                disabled={isSubmitting}
              />

              <InputGroup
                id="email"
                label="Email"
                type="email"
                registration={register('email')}
                error={errors.email?.message}
                disabled={isSubmitting}
              />

              <InputGroup
                id="senha"
                label="Nova senha (opcional)"
                type="password"
                placeholder="••••••••"
                registration={register('senha')}
                error={errors.senha?.message}
                disabled={isSubmitting}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white min-w-32"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

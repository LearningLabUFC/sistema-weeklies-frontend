import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header/Header';
import { api } from '@/lib/api';
import { StatsCards } from '@/components/StatsCards/StatsCards';
import { FilterBar } from '@/components/FilterBar/FilterBar';
import { UserList } from '@/components/UserList/UserList';

export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  matricula: string;
  data_ingresso: string;
  foto_perfil: string;
  curso_nome: string;
  status_nome: 'ativo' | 'pendente' | 'inativo' | string;
  role_nome: 'coordenadora' | 'admin' | 'aluno' | 'lider' | string;
}

interface ApiResponse {
  usuarios: Usuario[];
  total: number;
  pagina: number;
  limite: number;
}

export default function Participants() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [loading, setLoading] = useState(true);

  const [globalStats, setGlobalStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'todos' | 'ativo' | 'inativo'
  >('todos');

  const [pagina, setPagina] = useState(1);
  const limite = 20;

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const [resTotal, resAtivos, resInativos] = await Promise.all([
          api.get<ApiResponse>('/admin/users?limite=1'),
          api.get<ApiResponse>('/admin/users?status=ativo&limite=1'),
          api.get<ApiResponse>('/admin/users?status=inativo&limite=1'),
        ]);

        setGlobalStats({
          total: resTotal.data.total,
          ativos: resAtivos.data.total,
          inativos: resInativos.data.total,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas globais:', error);
      }
    };

    fetchGlobalStats();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pagina: pagina.toString(),
        limite: limite.toString(),
      });

      if (searchTerm) params.append('busca', searchTerm);
      if (selectedRole) params.append('role', selectedRole);
      if (filterStatus !== 'todos') params.append('status', filterStatus);

      const response = await api.get<ApiResponse>(
        `/admin/users?${params.toString()}`,
      );
      setUsuarios(response.data.usuarios);
      setTotalFiltrado(response.data.total);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, [pagina, limite, searchTerm, selectedRole, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagina(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedRole, filterStatus, fetchUsers]);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Alunos"
        subtitle="Acompanhe o progresso dos participantes"
      />

      <StatsCards
        stats={globalStats}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

      <UserList
        usuarios={usuarios}
        loading={loading}
        pagina={pagina}
        limite={limite}
        total={totalFiltrado}
        setPagina={setPagina}
      />
    </div>
  );
}

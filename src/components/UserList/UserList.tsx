import { useState } from 'react';
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Usuario } from '@/pages/admin/Participants/Participants';
import { UserDetailsModal } from '../UserDetailsModal/UserDetailsModal';

interface UserListProps {
  usuarios: Usuario[];
  loading: boolean;
  pagina: number;
  limite: number;
  total: number;
  setPagina: React.Dispatch<React.SetStateAction<number>>;
  // Adicionei um onUpdate aqui para repassar até o Participants.tsx se quiser,
  // ou você pode dar reload/re-fetch direto.
  onUpdate?: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const getRoleStyle = (role: string) => {
  const styles: Record<string, string> = {
    aluno: 'bg-[#457EFF]/10 text-[#457EFF] border-[#457EFF]/20',
    admin: 'bg-[#8204EE]/10 text-[#8204EE] border-[#8204EE]/20',
    super_admin: 'bg-[#F51BA3]/10 text-[#F51BA3] border-[#F51BA3]/20',
    leader:
      'bg-[#FFBF00]/10 text-[#D49E00] border-[#FFBF00]/20 dark:text-[#FFBF00]',
  };
  return (
    styles[role.toLowerCase()] ||
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  );
};

export function UserList({
  usuarios,
  loading,
  pagina,
  limite,
  total,
  setPagina,
  onUpdate = () => window.location.reload(), // Fallback simples para recarregar se a prop não for passada
}: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading && usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
            <p>Carregando participantes...</p>
          </div>
        ) : usuarios.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {usuarios.map(student => {
              const isActive = student.status_nome === 'ativo';

              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Avatar className="w-12 h-12 shrink-0 border dark:border-slate-700">
                    <AvatarImage
                      src={student.foto_perfil}
                      alt={student.nome_completo}
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium text-lg">
                      {getInitials(student.nome_completo)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-base mb-1.5 truncate">
                      {student.nome_completo}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs py-0.5 border ${getRoleStyle(student.role_nome)}`}
                      >
                        {student.role_nome.toUpperCase()}
                      </Badge>
                      {student.curso_nome && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs py-0.5"
                        >
                          {student.curso_nome}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 mt-3 sm:mt-0 flex items-center gap-4">
                    {isActive ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                          Em dia
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-sm text-rose-700 dark:text-rose-400 font-medium whitespace-nowrap">
                          Inativo
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedUser(student)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
                      aria-label="Opções do usuário"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Nenhum aluno encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Tente ajustar os filtros de busca ou limpar o termo digitado.
            </p>
          </div>
        )}
      </div>

      {total > limite && (
        <div className="flex justify-between items-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          <span>
            Mostrando {usuarios.length} de {total} participantes
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina(p => p + 1)}
              disabled={pagina * limite >= total}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Uso do novo componente Modal Separado */}
      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdate={() => {
          setSelectedUser(null);
          onUpdate(); // Chama a função pra dar fetch novamente na lista pai
        }}
      />
    </>
  );
}

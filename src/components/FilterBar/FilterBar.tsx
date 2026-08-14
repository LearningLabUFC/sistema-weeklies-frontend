import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ALL_ROLES = [
  { value: '', label: 'Todos os cargos' },
  { value: 'aluno', label: 'Alunos' },
  { value: 'leader', label: 'Líderes' },
  { value: 'admin', label: 'Administradores' },
];

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

export function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar alunos por nome ou e-mail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 sm:w-56"
        >
          {ALL_ROLES.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

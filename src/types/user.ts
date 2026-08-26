export interface User {
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
}

export interface RegisterData {
  nome_completo: string;
  email: string;
  senha: string;
  data_nascimento: string;
  matricula: string;
  curso_id: string;
  meta_horas_semanais: number;
}

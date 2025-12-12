export type AppRole = 'admin' | 'user';

export interface StatusOpcao {
  id: number;
  descricao: string;
}

export interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Lead {
  id: string;
  nome: string;
  sexo: 'M' | 'F' | null;
  ano_nascimento: number | null;
  classe: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  cidade: string | null;
  uf: string | null;
  status_id: number | null;
  telefone_1: string | null;
  telefone_2: string | null;
  telefone_3: string | null;
  telefone_4: string | null;
  telefone_5: string | null;
  observacoes: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface LeadWithStatus extends Lead {
  status_opcoes: StatusOpcao | null;
  profiles: Profile | null;
}
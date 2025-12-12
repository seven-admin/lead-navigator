import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadWithStatus, StatusOpcao } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useLeads(statusFilter?: number, search?: string) {
  return useQuery({
    queryKey: ['leads', statusFilter, search],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select(`
          *,
          status_opcoes (id, descricao),
          profiles (id, nome, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status_id', statusFilter);
      }

      if (search) {
        query = query.or(`nome.ilike.%${search}%,telefone_1.ilike.%${search}%,telefone_2.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LeadWithStatus[];
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          status_opcoes (id, descricao),
          profiles (id, nome, email)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as LeadWithStatus;
    },
    enabled: !!id,
  });
}

export function useStatusOpcoes() {
  return useQuery({
    queryKey: ['status_opcoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('status_opcoes')
        .select('*')
        .order('id');

      if (error) throw error;
      return data as StatusOpcao[];
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
      toast({
        title: 'Lead atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leads: Omit<Lead, 'id' | 'created_at'>[]) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(leads)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Leads importados',
        description: `${data.length} leads foram importados com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na importação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead excluído',
        description: 'O lead foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
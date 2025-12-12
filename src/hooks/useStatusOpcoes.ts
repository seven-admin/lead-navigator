import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StatusOpcao } from '@/types/database';

export function useStatusOpcoesAdmin() {
  return useQuery({
    queryKey: ['status-opcoes'],
    queryFn: async (): Promise<StatusOpcao[]> => {
      const { data, error } = await supabase
        .from('status_opcoes')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (descricao: string) => {
      const { error } = await supabase
        .from('status_opcoes')
        .insert({ descricao });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-opcoes'] });
      toast({
        title: 'Status criado',
        description: 'O novo status foi adicionado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, descricao }: { id: number; descricao: string }) => {
      const { error } = await supabase
        .from('status_opcoes')
        .update({ descricao })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-opcoes'] });
      toast({
        title: 'Status atualizado',
        description: 'O status foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Check if status is in use
      const { count, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status_id', id);

      if (countError) throw countError;

      if (count && count > 0) {
        throw new Error(`Este status está em uso por ${count} lead(s). Remova ou altere o status dos leads antes de excluir.`);
      }

      const { error } = await supabase
        .from('status_opcoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-opcoes'] });
      toast({
        title: 'Status excluído',
        description: 'O status foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

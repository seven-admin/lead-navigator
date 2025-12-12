import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeadInteracaoWithProfile, TipoInteracao } from '@/types/database';

export function useLeadInteracoes(leadId: string) {
  return useQuery({
    queryKey: ['lead-interacoes', leadId],
    queryFn: async (): Promise<LeadInteracaoWithProfile[]> => {
      const { data, error } = await supabase
        .from('lead_interacoes')
        .select(`
          *,
          profiles:user_id (id, nome, email)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as LeadInteracaoWithProfile[];
    },
    enabled: !!leadId,
  });
}

export function useCreateInteracao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      userId, 
      tipo, 
      descricao 
    }: { 
      leadId: string; 
      userId: string; 
      tipo: TipoInteracao; 
      descricao: string;
    }) => {
      const { error } = await supabase
        .from('lead_interacoes')
        .insert({
          lead_id: leadId,
          user_id: userId,
          tipo,
          descricao,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-interacoes', variables.leadId] });
      toast({
        title: 'Interação registrada',
        description: 'A interação foi adicionada ao histórico.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao registrar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteInteracao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      const { error } = await supabase
        .from('lead_interacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return leadId;
    },
    onSuccess: (leadId) => {
      queryClient.invalidateQueries({ queryKey: ['lead-interacoes', leadId] });
      toast({
        title: 'Interação removida',
        description: 'A interação foi removida do histórico.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

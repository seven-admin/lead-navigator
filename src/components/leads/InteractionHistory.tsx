import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLeadInteracoes, useCreateInteracao, useDeleteInteracao } from '@/hooks/useLeadInteracoes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Phone, MessageSquare, Users, FileText, Mail, Plus, Loader2, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TipoInteracao } from '@/types/database';

interface InteractionHistoryProps {
  leadId: string;
}

const tipoConfig: Record<TipoInteracao, { label: string; icon: typeof Phone; color: string }> = {
  ligacao: { label: 'Ligação', icon: Phone, color: 'bg-blue-500' },
  mensagem: { label: 'Mensagem', icon: MessageSquare, color: 'bg-green-500' },
  reuniao: { label: 'Reunião', icon: Users, color: 'bg-yellow-500' },
  nota: { label: 'Nota', icon: FileText, color: 'bg-gray-500' },
  email: { label: 'Email', icon: Mail, color: 'bg-red-500' },
};

export function InteractionHistory({ leadId }: InteractionHistoryProps) {
  const { user, isAdmin } = useAuthContext();
  const { data: interacoes, isLoading } = useLeadInteracoes(leadId);
  const createInteracao = useCreateInteracao();
  const deleteInteracao = useDeleteInteracao();

  const [isAdding, setIsAdding] = useState(false);
  const [tipo, setTipo] = useState<TipoInteracao>('ligacao');
  const [descricao, setDescricao] = useState('');

  const handleSubmit = async () => {
    if (!descricao.trim() || !user) return;

    await createInteracao.mutateAsync({
      leadId,
      userId: user.id,
      tipo,
      descricao: descricao.trim(),
    });

    setDescricao('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteInteracao.mutateAsync({ id, leadId });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Interações
        </CardTitle>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de interação</label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoInteracao)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descreva a interação..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!descricao.trim() || createInteracao.isPending}
              >
                {createInteracao.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : interacoes && interacoes.length > 0 ? (
          <div className="space-y-3">
            {interacoes.map((interacao) => {
              const config = tipoConfig[interacao.tipo];
              const Icon = config.icon;

              return (
                <div
                  key={interacao.id}
                  className="flex gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {interacao.profiles?.nome || interacao.profiles?.email || 'Usuário'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(interacao.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir interação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(interacao.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">
                      {interacao.descricao}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma interação registrada
          </p>
        )}
      </CardContent>
    </Card>
  );
}

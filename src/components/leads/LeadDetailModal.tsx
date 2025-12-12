import { useState, useEffect } from 'react';
import { useLead, useUpdateLead, useStatusOpcoes, useDeleteLead } from '@/hooks/useLeads';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { InteractionHistory } from '@/components/leads/InteractionHistory';
import { Phone, MapPin, User, Calendar, Trash2, Loader2, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LeadDetailModalProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailModal({ leadId, open, onOpenChange }: LeadDetailModalProps) {
  const { isAdmin } = useAuthContext();
  const { data: lead, isLoading } = useLead(leadId || '');
  const { data: statusOpcoes } = useStatusOpcoes();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  
  const [observacoes, setObservacoes] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Reset state when lead changes
  useEffect(() => {
    setObservacoes(null);
    setSelectedStatus(null);
  }, [leadId]);

  if (!leadId) return null;

  const handleSave = () => {
    if (!lead) return;
    
    const updates: Record<string, unknown> = { id: lead.id };
    
    if (observacoes !== null && observacoes !== lead.observacoes) {
      updates.observacoes = observacoes;
    }
    
    if (selectedStatus !== null && selectedStatus !== lead.status_id?.toString()) {
      updates.status_id = parseInt(selectedStatus);
    }

    if (Object.keys(updates).length > 1) {
      updateLead.mutate(updates as { id: string });
    }
  };

  const handleDelete = () => {
    if (!lead) return;
    deleteLead.mutate(lead.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const phones = lead ? [
    lead.telefone_1,
    lead.telefone_2,
    lead.telefone_3,
    lead.telefone_4,
    lead.telefone_5,
  ].filter(Boolean) : [];

  const fullAddress = lead ? [
    lead.endereco,
    lead.numero && `nº ${lead.numero}`,
    lead.complemento,
    lead.bairro,
    lead.cidade && lead.uf && `${lead.cidade} - ${lead.uf}`,
    lead.cep && `CEP: ${lead.cep}`,
  ].filter(Boolean).join(', ') : '';

  const currentObservacoes = observacoes ?? lead?.observacoes ?? '';
  const currentStatus = selectedStatus ?? lead?.status_id?.toString() ?? '';

  const hasChanges = lead && (
    (observacoes !== null && observacoes !== lead.observacoes) ||
    (selectedStatus !== null && selectedStatus !== lead.status_id?.toString())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !lead ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lead não encontrado</p>
          </div>
        ) : (
          <>
            <DialogHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl">{lead.nome}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {lead.sexo === 'M' ? 'Masculino' : lead.sexo === 'F' ? 'Feminino' : lead.sexo === 'I' ? 'Indeterminado' : ''}
                  {lead.ano_nascimento && ` • Nascimento: ${lead.ano_nascimento}`}
                  {lead.classe && ` • Classe ${lead.classe}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {lead.status_opcoes && (
                  <StatusBadge status={lead.status_opcoes.descricao} />
                )}
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O lead será permanentemente removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {phones.length > 0 ? (
                      <div className="grid gap-1">
                        {phones.map((phone, index) => (
                          <a
                            key={index}
                            href={`tel:${phone}`}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-accent transition-colors text-sm"
                          >
                            <Phone className="h-3 w-3 text-primary" />
                            <span className="font-medium">{phone}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum telefone</p>
                    )}
                  </CardContent>
                </Card>

                {fullAddress && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-foreground">{fullAddress}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {lead.profiles && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Atribuído a
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-foreground">
                        {lead.profiles.nome || lead.profiles.email}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Select
                      value={currentStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOpcoes?.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Observações</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    placeholder="Adicione observações sobre este lead..."
                    value={currentObservacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                </CardContent>
              </Card>

              {hasChanges && (
                <Button
                  onClick={handleSave}
                  disabled={updateLead.isPending}
                  className="w-full"
                >
                  {updateLead.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar alterações
                </Button>
              )}

              <InteractionHistory leadId={leadId} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
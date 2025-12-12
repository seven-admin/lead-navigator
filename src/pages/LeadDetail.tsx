import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLead, useStatusOpcoes, useDeleteLead } from '@/hooks/useLeads';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { InteractionHistory } from '@/components/leads/InteractionHistory';
import { ArrowLeft, Phone, MapPin, User, Calendar, Trash2, Loader2, Save } from 'lucide-react';
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

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const { data: lead, isLoading } = useLead(id!);
  const { data: statusOpcoes } = useStatusOpcoes();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  
  const [observacoes, setObservacoes] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <p className="text-muted-foreground">Lead não encontrado</p>
      </div>
    );
  }

  const phones = [
    lead.telefone_1,
    lead.telefone_2,
    lead.telefone_3,
    lead.telefone_4,
    lead.telefone_5,
  ].filter(Boolean);

  const fullAddress = [
    lead.endereco,
    lead.numero && `nº ${lead.numero}`,
    lead.complemento,
    lead.bairro,
    lead.cidade && lead.uf && `${lead.cidade} - ${lead.uf}`,
    lead.cep && `CEP: ${lead.cep}`,
  ].filter(Boolean).join(', ');

  const currentObservacoes = observacoes ?? lead.observacoes ?? '';
  const currentStatus = selectedStatus ?? lead.status_id?.toString() ?? '';

  const handleSave = () => {
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
    deleteLead.mutate(lead.id, {
      onSuccess: () => navigate('/leads'),
    });
  };

  const hasChanges = 
    (observacoes !== null && observacoes !== lead.observacoes) ||
    (selectedStatus !== null && selectedStatus !== lead.status_id?.toString());

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
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

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{lead.nome}</h1>
            <p className="text-muted-foreground">
              {lead.sexo === 'M' ? 'Masculino' : lead.sexo === 'F' ? 'Feminino' : lead.sexo === 'I' ? 'Indeterminado' : ''}
              {lead.ano_nascimento && ` • Nascimento: ${lead.ano_nascimento}`}
              {lead.classe && ` • Classe ${lead.classe}`}
            </p>
          </div>
          {lead.status_opcoes && (
            <StatusBadge status={lead.status_opcoes.descricao} />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Telefones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {phones.length > 0 ? (
                <div className="grid gap-2">
                  {phones.map((phone, index) => (
                    <a
                      key={index}
                      href={`tel:${phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                    >
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-medium">{phone}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum telefone cadastrado</p>
              )}
            </CardContent>
          </Card>

          {fullAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{fullAddress}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {lead.profiles && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Atribuído a
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  {lead.profiles.nome || lead.profiles.email}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={currentStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
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
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações sobre este lead..."
              value={currentObservacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
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

        {/* Histórico de Interações */}
        <InteractionHistory leadId={id!} />
      </div>
    </div>
  );
}

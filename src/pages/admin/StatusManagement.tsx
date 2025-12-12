import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStatusOpcoesAdmin, useCreateStatus, useUpdateStatus, useDeleteStatus } from '@/hooks/useStatusOpcoes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/leads/StatusBadge';

export default function StatusManagement() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const { data: statusOpcoes, isLoading } = useStatusOpcoesAdmin();
  const createStatus = useCreateStatus();
  const updateStatus = useUpdateStatus();
  const deleteStatus = useDeleteStatus();

  const [newStatusName, setNewStatusName] = useState('');
  const [editingStatus, setEditingStatus] = useState<{ id: number; descricao: string } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso restrito</h2>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar status.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newStatusName.trim()) return;
    await createStatus.mutateAsync(newStatusName.trim().toUpperCase());
    setNewStatusName('');
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingStatus || !editingStatus.descricao.trim()) return;
    await updateStatus.mutateAsync({ id: editingStatus.id, descricao: editingStatus.descricao.trim().toUpperCase() });
    setEditingStatus(null);
    setIsEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteStatus.mutateAsync(id);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Status</h1>
          <p className="text-muted-foreground">
            Configure os status de atendimento dos leads
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status-name">Nome do status</Label>
                <Input
                  id="status-name"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="Ex: EM NEGOCIAÇÃO"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createStatus.isPending || !newStatusName.trim()}>
                {createStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusOpcoes?.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {status.id}
                    </TableCell>
                    <TableCell className="font-medium">{status.descricao}</TableCell>
                    <TableCell>
                      <StatusBadge status={status.descricao} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={isEditOpen && editingStatus?.id === status.id} onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setEditingStatus(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingStatus({ id: status.id, descricao: status.descricao })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-status-name">Nome do status</Label>
                              <Input
                                id="edit-status-name"
                                value={editingStatus?.descricao || ''}
                                onChange={(e) => setEditingStatus(prev => prev ? { ...prev, descricao: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleUpdate} disabled={updateStatus.isPending}>
                              {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Salvar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir status?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Certifique-se de que nenhum lead está usando este status.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(status.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUsers, useUpdateUserRole, useUpdateUserProfile, useCreateUser, useDeleteUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, AlertCircle, Shield, User, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppRole } from '@/types/database';

export default function UsersAdmin() {
  const navigate = useNavigate();
  const { isAdmin, user: currentUser } = useAuthContext();
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const updateProfile = useUpdateUserProfile();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  
  const [filter, setFilter] = useState<'all' | AppRole>('all');
  
  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('user');
  
  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  
  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState('');

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
              Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users?.filter(u => filter === 'all' || u.role === filter) || [];

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    updateRole.mutate({ userId, role: newRole });
  };

  const handleCreateUser = () => {
    if (!newEmail || !newPassword) return;
    
    createUser.mutate(
      { email: newEmail, password: newPassword, nome: newNome || undefined, role: newRole },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setNewEmail('');
          setNewPassword('');
          setNewNome('');
          setNewRole('user');
        },
      }
    );
  };

  const handleEditUser = () => {
    if (!editUserId) return;
    
    updateProfile.mutate(
      { userId: editUserId, nome: editNome },
      {
        onSuccess: () => {
          setEditOpen(false);
          setEditUserId(null);
          setEditNome('');
        },
      }
    );
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    
    deleteUser.mutate(deleteUserId, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteUserId(null);
        setDeleteUserName('');
      },
    });
  };

  const openEditDialog = (user: { id: string; nome: string | null }) => {
    setEditUserId(user.id);
    setEditNome(user.nome || '');
    setEditOpen(true);
  };

  const openDeleteDialog = (user: { id: string; nome: string | null; email: string | null }) => {
    setDeleteUserId(user.id);
    setDeleteUserName(user.nome || user.email || 'Usuário');
    setDeleteOpen(true);
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
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Crie, edite e gerencie as permissões dos usuários
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Usuários</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | AppRole)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Usuários</SelectItem>
            </SelectContent>
          </Select>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nome || '-'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? (
                          <><Shield className="h-3 w-3 mr-1" /> Admin</>
                        ) : (
                          <><User className="h-3 w-3 mr-1" /> Usuário</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.id !== currentUser?.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(v) => handleRoleChange(user.id, v as AppRole)}
                            disabled={updateRole.isPending}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">Usuário</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Você</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie uma nova conta de usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Permissão</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={!newEmail || !newPassword || createUser.isPending}
            >
              {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere o nome do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editNome">Nome</Label>
              <Input
                id="editNome"
                placeholder="Nome completo"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteUserName}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

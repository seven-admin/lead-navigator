import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLead } from '@/hooks/useLeads';
import { useStatusOpcoes } from '@/hooks/useLeads';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const createLeadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  sexo: z.enum(['M', 'F', 'I']).nullable().optional(),
  ano_nascimento: z.number().nullable().optional(),
  classe: z.enum(['A', 'B', 'C', 'D', 'E']).nullable().optional(),
  telefone_1: z.string().nullable().optional(),
  telefone_2: z.string().nullable().optional(),
  telefone_3: z.string().nullable().optional(),
  telefone_4: z.string().nullable().optional(),
  telefone_5: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  origem: z.enum(['Seven', 'Parceiro'], { required_error: 'Origem é obrigatória' }),
  status_id: z.number().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeadModal({ open, onOpenChange }: CreateLeadModalProps) {
  const { isAdmin, user } = useAuth();
  const { data: statusOpcoes } = useStatusOpcoes();
  const { data: profiles } = useProfiles();
  const createLead = useCreateLead();

  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      nome: '',
      sexo: null,
      ano_nascimento: null,
      classe: null,
      telefone_1: null,
      telefone_2: null,
      telefone_3: null,
      telefone_4: null,
      telefone_5: null,
      cep: null,
      uf: null,
      cidade: null,
      bairro: null,
      endereco: null,
      numero: null,
      complemento: null,
      origem: undefined,
      status_id: 1, // SEM CONTATO
      assigned_to: null,
      observacoes: null,
    },
  });

  const onSubmit = (data: CreateLeadFormData) => {
    // Se não for admin, atribuir automaticamente ao próprio usuário
    const leadData = {
      nome: data.nome,
      origem: data.origem,
      assigned_to: isAdmin ? (data.assigned_to || null) : user?.id || null,
      ano_nascimento: data.ano_nascimento || null,
      sexo: data.sexo || null,
      classe: data.classe || null,
      telefone_1: data.telefone_1 || null,
      telefone_2: data.telefone_2 || null,
      telefone_3: data.telefone_3 || null,
      telefone_4: data.telefone_4 || null,
      telefone_5: data.telefone_5 || null,
      cep: data.cep || null,
      uf: data.uf || null,
      cidade: data.cidade || null,
      bairro: data.bairro || null,
      endereco: data.endereco || null,
      numero: data.numero || null,
      complemento: data.complemento || null,
      status_id: data.status_id || 1,
      observacoes: data.observacoes || null,
    };

    createLead.mutate(leadData, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Dados Pessoais</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo</FormLabel>
                      <Select
                        value={field.value || ''}
                        onValueChange={(value) => field.onChange(value || null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                          <SelectItem value="I">Indeterminado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="ano_nascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano Nasc.</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1990"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classe</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(value) => field.onChange(value || null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sel." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {['telefone_1', 'telefone_2', 'telefone_3', 'telefone_4', 'telefone_5'].map((phoneName, index) => (
                  <FormField
                    key={phoneName}
                    control={form.control}
                    name={phoneName as keyof CreateLeadFormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            value={(field.value as string) ?? ''}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SP"
                          maxLength={2}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase() || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="São Paulo"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Centro"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, Avenida..."
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto, Bloco..."
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Informações do Lead */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Informações do Lead</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem *</FormLabel>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Seven">Seven</SelectItem>
                          <SelectItem value="Parceiro">Parceiro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value?.toString() || '1'}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOpcoes?.map((status) => (
                            <SelectItem key={status.id} value={status.id.toString()}>
                              {status.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Atribuir a</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(value) => field.onChange(value || null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um usuário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {profiles?.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.nome || profile.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações sobre o lead..."
                          rows={3}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cadastrar Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
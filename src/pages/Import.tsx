import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useCreateLeads, useStatusOpcoes } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Lead } from '@/types/database';

interface CSVRow {
  [key: string]: string;
}

const columnMapping: Record<string, keyof Omit<Lead, 'id' | 'created_at'>> = {
  'nome': 'nome',
  'name': 'nome',
  'sexo': 'sexo',
  'genero': 'sexo',
  'ano_nascimento': 'ano_nascimento',
  'ano': 'ano_nascimento',
  'nascimento': 'ano_nascimento',
  'classe': 'classe',
  'endereco': 'endereco',
  'endereço': 'endereco',
  'address': 'endereco',
  'numero': 'numero',
  'número': 'numero',
  'num': 'numero',
  'complemento': 'complemento',
  'bairro': 'bairro',
  'cep': 'cep',
  'cidade': 'cidade',
  'city': 'cidade',
  'uf': 'uf',
  'estado': 'uf',
  'state': 'uf',
  'telefone_1': 'telefone_1',
  'telefone1': 'telefone_1',
  'telefone': 'telefone_1',
  'phone': 'telefone_1',
  'celular': 'telefone_1',
  'telefone_2': 'telefone_2',
  'telefone2': 'telefone_2',
  'telefone_3': 'telefone_3',
  'telefone3': 'telefone_3',
  'telefone_4': 'telefone_4',
  'telefone4': 'telefone_4',
  'telefone_5': 'telefone_5',
  'telefone5': 'telefone_5',
  'observacoes': 'observacoes',
  'observações': 'observacoes',
  'obs': 'observacoes',
  'notes': 'observacoes',
};

export default function Import() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();
  const { data: profiles } = useProfiles();
  const { data: statusOpcoes } = useStatusOpcoes();
  const createLeads = useCreateLeads();

  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('1');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

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
              Apenas administradores podem importar leads.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parseCSV = (text: string): { headers: string[]; data: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const data = lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, data };
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo CSV.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, data } = parseCSV(text);
      setHeaders(headers);
      setCsvData(data);
    };
    reader.readAsText(selectedFile, 'UTF-8');
  }, []);

  const mapRowToLead = (row: CSVRow): Omit<Lead, 'id' | 'created_at'> => {
    const lead: Record<string, unknown> = {
      nome: '',
      status_id: parseInt(selectedStatus) || 1,
      assigned_to: selectedUser || null,
    };

    Object.entries(row).forEach(([key, value]) => {
      const mappedKey = columnMapping[key.toLowerCase()];
      if (mappedKey && value) {
        if (mappedKey === 'ano_nascimento') {
          const year = parseInt(value);
          if (!isNaN(year)) lead[mappedKey] = year;
        } else if (mappedKey === 'sexo') {
          const normalized = value.toUpperCase().charAt(0);
          if (normalized === 'M' || normalized === 'F' || normalized === 'I') {
            lead[mappedKey] = normalized;
          }
        } else if (mappedKey === 'classe') {
          const normalized = value.toUpperCase().charAt(0);
          if (['A', 'B', 'C', 'D', 'E'].includes(normalized)) {
            lead[mappedKey] = normalized;
          }
        } else if (mappedKey === 'uf') {
          lead[mappedKey] = value.toUpperCase().substring(0, 2);
        } else {
          lead[mappedKey] = value;
        }
      }
    });

    return lead as Omit<Lead, 'id' | 'created_at'>;
  };

  const handleImport = async () => {
    const validRows = csvData.filter(row => {
      const nome = Object.entries(row).find(([key]) => 
        columnMapping[key.toLowerCase()] === 'nome'
      )?.[1];
      return nome && nome.trim();
    });

    if (validRows.length === 0) {
      toast({
        title: 'Nenhum lead válido',
        description: 'Não foram encontrados leads com nome preenchido.',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < validRows.length; i += batchSize) {
      batches.push(validRows.slice(i, i + batchSize));
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        const leads = batches[i].map(mapRowToLead);
        await createLeads.mutateAsync(leads);
        setProgress(((i + 1) / batches.length) * 100);
      }

      toast({
        title: 'Importação concluída!',
        description: `${validRows.length} leads foram importados.`,
      });

      navigate('/leads');
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const getMappedColumns = () => {
    return headers.filter(h => columnMapping[h.toLowerCase()]);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Importar Leads</h1>
        <p className="text-muted-foreground">
          Faça upload de um arquivo CSV para importar leads em massa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Selecionar arquivo</CardTitle>
          <CardDescription>
            O arquivo deve estar no formato CSV com colunas como: nome, telefone, cidade, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {csvData.length} linhas encontradas
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar ou arraste o arquivo
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>2. Configurações de importação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Atribuir leads para:
                </label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum (sem atribuição)</SelectItem>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.nome || profile.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Status inicial:
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOpcoes?.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Colunas mapeadas:
                </label>
                <div className="flex flex-wrap gap-2">
                  {getMappedColumns().map((col) => (
                    <span
                      key={col}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      <Check className="h-3 w-3" />
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Preview dos dados</CardTitle>
              <CardDescription>
                Mostrando as primeiras 5 linhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 6).map((header) => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {headers.slice(0, 6).map((header) => (
                          <TableCell key={header} className="whitespace-nowrap">
                            {row[header] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {importing && (
            <Card>
              <CardContent className="py-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importando...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleImport}
            disabled={importing}
            className="w-full"
            size="lg"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar {csvData.length} leads
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
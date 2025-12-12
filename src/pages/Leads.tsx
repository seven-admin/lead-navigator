import { MainLayout } from '@/components/layout/MainLayout';
import { LeadsList } from '@/components/leads/LeadsList';

export default function Leads() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-muted-foreground">
          Gerencie seus leads e acompanhe o status
        </p>
      </div>

      <LeadsList />
    </div>
  );
}
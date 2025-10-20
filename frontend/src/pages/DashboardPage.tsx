import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await api.get('/api/analytics/overview')).data,
  });

  const tasks = data?.tasksByStatus ?? {};
  const invoices = data?.invoiceAmountsByStatus ?? {};

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-2">Tasks</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {['pending','in_progress','completed'].map((s) => (
            <div key={s} className="rounded bg-gray-50 p-3">
              <div className="text-sm text-gray-500">{s.replace('_',' ')}</div>
              <div className="text-2xl font-bold">{tasks[s] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-2">Invoices</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {['unpaid','overdue','paid'].map((s) => (
            <div key={s} className="rounded bg-gray-50 p-3">
              <div className="text-sm text-gray-500">{s}</div>
              <div className="text-2xl font-bold">${invoices[s]?.toFixed?.(2) ?? '0.00'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

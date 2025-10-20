import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function CalendarPage() {
  const { data } = useQuery({ queryKey: ['calendar'], queryFn: async () => (await api.get('/api/calendar')).data });
  const tasks = data?.tasks ?? [];
  const invoices = data?.invoices ?? [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-2">Task Due Dates</h2>
        <ul className="space-y-1">
          {tasks.map((t: any) => (
            <li key={t.id} className="flex justify-between"><span>{t.title}</span><span>{t.date?.slice(0,10)}</span></li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-2">Invoice Due Dates</h2>
        <ul className="space-y-1">
          {invoices.map((i: any) => (
            <li key={i.id} className="flex justify-between"><span>{i.id.slice(0,6)}...</span><span>{i.date?.slice(0,10)}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

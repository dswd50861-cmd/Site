import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function InvoicesPage() {
  const { data } = useQuery({ queryKey: ['invoices'], queryFn: async () => (await api.get('/api/invoices')).data });
  return (
    <div className="rounded-lg border bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b"><th className="p-3">Customer</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Due</th></tr>
        </thead>
        <tbody>
          {(data ?? []).map((inv: any) => (
            <tr key={inv.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{inv.customer_name}</td>
              <td className="p-3">${inv.amount}</td>
              <td className="p-3">{inv.status}</td>
              <td className="p-3">{inv.due_date?.slice(0,10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

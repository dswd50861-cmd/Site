import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function CustomersPage() {
  const { data } = useQuery({ queryKey: ['customers'], queryFn: async () => (await api.get('/api/customers')).data });
  return (
    <div className="rounded-lg border bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th></tr>
        </thead>
        <tbody>
          {(data ?? []).map((c: any) => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

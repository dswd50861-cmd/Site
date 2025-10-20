import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useState } from 'react';

export default function TasksPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['tasks'], queryFn: async () => (await api.get('/api/tasks')).data });

  const [title, setTitle] = useState('');
  const createTask = useMutation({
    mutationFn: async () => (await api.post('/api/tasks', { title })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setTitle(''); },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task title" className="border rounded px-3 py-2 flex-1" />
          <button onClick={() => createTask.mutate()} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b"><th className="p-3">Title</th><th className="p-3">Priority</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((t: any) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{t.title}</td>
                <td className="p-3">{t.priority}</td>
                <td className="p-3">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

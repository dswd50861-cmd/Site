import { useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', r.data.token);
      navigate('/');
    } catch (e) {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-24 bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border rounded w-full px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded w-full px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 w-full" type="submit">Sign in</button>
      </form>
    </div>
  );
}

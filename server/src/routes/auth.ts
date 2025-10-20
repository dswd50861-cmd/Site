import { Express, Request, Response } from 'express';
import { pool } from '../db/pool';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { signAuthToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'employee', 'accountant']).default('employee'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function registerAuthRoutes(app: Express) {
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password, role } = parsed.data;
    const existing = await pool.query('select id from users where email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    try {
      await pool.query(
        'insert into users (id, email, password_hash, role) values ($1,$2,$3,$4)',
        [id, email.toLowerCase(), passwordHash, role]
      );
      const token = signAuthToken({ userId: id, role });
      return res.json({ token });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to register' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const result = await pool.query('select id, password_hash, role from users where email = $1', [
      email.toLowerCase(),
    ]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0] as { id: string; password_hash: string; role: 'admin' | 'employee' | 'accountant' };
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signAuthToken({ userId: user.id, role: user.role });
    return res.json({ token });
  });
}

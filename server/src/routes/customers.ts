import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export function registerCustomerRoutes(app: Express) {
  app.get('/api/customers', authMiddleware, async (_req: Request, res: Response) => {
    const r = await pool.query('select * from customers order by created_at desc');
    res.json(r.rows);
  });

  app.post('/api/customers', authMiddleware, async (req: Request, res: Response) => {
    const parsed = customerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = uuidv4();
    const { name, email, phone, company, notes } = parsed.data;
    await pool.query(
      `insert into customers (id, name, email, phone, company, notes)
       values ($1,$2,$3,$4,$5,$6)`,
      [id, name, email ?? null, phone ?? null, company ?? null, notes ?? null]
    );
    const r = await pool.query('select * from customers where id = $1', [id]);
    res.status(201).json(r.rows[0]);
  });

  app.put('/api/customers/:id', authMiddleware, async (req: Request, res: Response) => {
    const parsed = customerSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = req.params.id;

    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(parsed.data)) {
      sets.push(`${key} = $${i++}`);
      values.push(value);
    }
    if (sets.length === 0) return res.json({ ok: true });
    values.push(id);
    await pool.query(`update customers set ${sets.join(', ')} where id = $${i}`,[...values]);
    const r = await pool.query('select * from customers where id = $1', [id]);
    res.json(r.rows[0]);
  });

  app.delete('/api/customers/:id', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id;
    await pool.query('delete from customers where id = $1', [id]);
    res.status(204).send();
  });
}

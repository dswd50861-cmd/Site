import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  customerId: z.string().uuid().nullable().optional(),
});

export function registerTaskRoutes(app: Express) {
  app.get('/api/tasks', authMiddleware, async (_req: Request, res: Response) => {
    const r = await pool.query('select * from tasks order by due_date nulls last, created_at desc');
    res.json(r.rows);
  });

  app.post('/api/tasks', authMiddleware, async (req: Request, res: Response) => {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = uuidv4();
    const {
      title,
      description,
      status = 'pending',
      priority = 'normal',
      dueDate,
      assignedTo,
      customerId,
    } = parsed.data;
    await pool.query(
      `insert into tasks (id, title, description, status, priority, due_date, assigned_to, customer_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, title, description ?? null, status, priority, dueDate ?? null, assignedTo ?? null, customerId ?? null]
    );
    const r = await pool.query('select * from tasks where id = $1', [id]);
    res.status(201).json(r.rows[0]);
  });

  app.put('/api/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
    const parsed = taskSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = req.params.id;
    const fields = parsed.data;

    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(fields)) {
      if (key === 'dueDate') {
        sets.push(`due_date = $${i++}`);
        values.push(value);
      } else if (key === 'assignedTo') {
        sets.push(`assigned_to = $${i++}`);
        values.push(value);
      } else if (key === 'customerId') {
        sets.push(`customer_id = $${i++}`);
        values.push(value);
      } else {
        sets.push(`${key} = $${i++}`);
        values.push(value);
      }
    }
    if (sets.length === 0) return res.json({ ok: true });
    values.push(id);
    await pool.query(`update tasks set ${sets.join(', ')}, updated_at = now() where id = $${i}`,[...values]);
    const r = await pool.query('select * from tasks where id = $1', [id]);
    res.json(r.rows[0]);
  });

  app.delete('/api/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id;
    await pool.query('delete from tasks where id = $1', [id]);
    res.status(204).send();
  });
}

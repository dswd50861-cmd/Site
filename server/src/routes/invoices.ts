import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const invoiceSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(['unpaid', 'paid', 'overdue']).optional(),
  dueDate: z.string().datetime().optional(),
});

export function registerInvoiceRoutes(app: Express) {
  app.get('/api/invoices', authMiddleware, async (_req: Request, res: Response) => {
    const r = await pool.query(
      `select invoices.*, customers.name as customer_name
       from invoices left join customers on invoices.customer_id = customers.id
       order by due_date nulls last, issued_date desc`
    );
    res.json(r.rows);
  });

  app.post('/api/invoices', authMiddleware, async (req: Request, res: Response) => {
    const parsed = invoiceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = uuidv4();
    const { customerId, amount, status = 'unpaid', dueDate } = parsed.data;
    await pool.query(
      `insert into invoices (id, customer_id, amount, status, due_date)
       values ($1,$2,$3,$4,$5)`,
      [id, customerId, amount, status, dueDate ?? null]
    );
    const r = await pool.query('select * from invoices where id = $1', [id]);
    res.status(201).json(r.rows[0]);
  });

  app.put('/api/invoices/:id', authMiddleware, async (req: Request, res: Response) => {
    const parsed = invoiceSchema.partial().extend({ paidDate: z.string().datetime().optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = req.params.id;

    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(parsed.data)) {
      if (key === 'customerId') {
        sets.push(`customer_id = $${i++}`);
        values.push(value);
      } else if (key === 'dueDate') {
        sets.push(`due_date = $${i++}`);
        values.push(value);
      } else if (key === 'paidDate') {
        sets.push(`paid_date = $${i++}`);
        values.push(value);
      } else {
        sets.push(`${key} = $${i++}`);
        values.push(value);
      }
    }
    if (sets.length === 0) return res.json({ ok: true });
    values.push(id);
    await pool.query(`update invoices set ${sets.join(', ')} where id = $${i}`,[...values]);
    const r = await pool.query('select * from invoices where id = $1', [id]);
    res.json(r.rows[0]);
  });

  app.delete('/api/invoices/:id', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id;
    await pool.query('delete from invoices where id = $1', [id]);
    res.status(204).send();
  });
}

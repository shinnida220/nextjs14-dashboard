'use server';

import { z } from 'zod';
import dBClient from './db-client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  const rawFormDataEntries = Object.fromEntries(formData.entries());

  // Test it out:
  console.log({ rawFormData, rawFormDataEntries });

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await dBClient.query(`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES ('${customerId}', '${amountInCents}', '${status}', '${date})')
  `);

  // Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.
  revalidatePath('/dashboard/invoices');

  // redirect the user back to
  redirect('/dashboard/invoices');
}

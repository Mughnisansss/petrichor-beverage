import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await readDb();

  const initialLength = data.sales.length;
  data.sales = data.sales.filter(s => s.id !== id);

  if (data.sales.length === initialLength) {
    return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
  }

  await writeDb(data);
  return NextResponse.json({ message: 'Penjualan berhasil dihapus.' }, { status: 200 });
}

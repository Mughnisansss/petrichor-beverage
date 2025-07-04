
import { NextResponse } from 'next/server';
import { writeDb } from '@/lib/db';
import type { DbData } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const dataToImport: DbData = await request.json();

    // Basic validation to ensure we're not writing garbage
    if (
      !dataToImport ||
      !Array.isArray(dataToImport.drinks) ||
      !Array.isArray(dataToImport.foods) ||
      !Array.isArray(dataToImport.sales) ||
      !Array.isArray(dataToImport.operationalCosts) ||
      !Array.isArray(dataToImport.rawMaterials)
    ) {
      return NextResponse.json({ message: 'Data JSON tidak valid atau formatnya salah.' }, { status: 400 });
    }

    await writeDb(dataToImport);
    return NextResponse.json({ message: 'Data berhasil diimpor.' }, { status: 200 });
  } catch (error) {
    console.error("Error importing data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: `Gagal mengimpor data: ${errorMessage}` }, { status: 500 });
  }
}

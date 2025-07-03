import { promises as fs } from 'fs';
import path from 'path';
import type { Drink, Sale, OperationalCost } from './types';

interface DbData {
  drinks: Drink[];
  sales: Sale[];
  operationalCosts: OperationalCost[];
}

const dbPath = path.join(process.cwd(), 'db.json');

export async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const defaultData: DbData = { drinks: [], sales: [], operationalCosts: [] };
      await writeDb(defaultData);
      return defaultData;
    }
    console.error("Error reading database:", error);
    throw new Error("Could not read database file.");
  }
}

export async function writeDb(data: DbData): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing to database:", error);
    throw new Error("Could not write to database file.");
  }
}

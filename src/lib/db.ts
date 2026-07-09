import { promises as fs } from 'fs';
import path from 'path';
import type { DbData } from './types';

const dbPath = path.join(process.cwd(), 'db.json');

export async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    const parsedData = JSON.parse(data);
    // Ensure foods array exists for backward compatibility
    if (!parsedData.foods) {
      parsedData.foods = [];
    }
    return parsedData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, create it with a default structure
      const defaultData: DbData = { drinks: [], foods: [], sales: [], operationalCosts: [], rawMaterials: [] };
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

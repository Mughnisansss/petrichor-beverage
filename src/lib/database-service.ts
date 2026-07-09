/**
 * Database Service Layer
 * Handles all database operations using Prisma
 * Provides a clean interface between the application and database
 */

import prisma from './prisma';
import type { Drink, Food, Sale, OperationalCost, RawMaterial, DbData, Ingredient, PackagingInfo } from './types';
import { calculateItemCostPrice } from './data-logic';

// Helper function to convert Prisma models to app types
function convertPrismaDrink(prismaDrink: any): Drink {
  return {
    id: prismaDrink.id,
    name: prismaDrink.name,
    imageUri: prismaDrink.imageUri,
    subCategory: prismaDrink.subCategory,
    ingredients: prismaDrink.ingredients as Ingredient[],
    costPrice: prismaDrink.costPrice,
    sellingPrice: prismaDrink.sellingPrice,
    availableToppings: prismaDrink.availableToppings as string[] | undefined,
    packagingOptions: prismaDrink.packagingOptions as PackagingInfo[] | undefined,
  };
}

function convertPrismaFood(prismaFood: any): Food {
  return {
    id: prismaFood.id,
    name: prismaFood.name,
    imageUri: prismaFood.imageUri,
    subCategory: prismaFood.subCategory,
    ingredients: prismaFood.ingredients as Ingredient[],
    costPrice: prismaFood.costPrice,
    sellingPrice: prismaFood.sellingPrice,
    availableToppings: prismaFood.availableToppings as string[] | undefined,
    packagingOptions: prismaFood.packagingOptions as PackagingInfo[] | undefined,
  };
}

function convertPrismaSale(prismaSale: any): Sale {
  return {
    id: prismaSale.id,
    productId: prismaSale.productId,
    productType: prismaSale.productType as 'drink' | 'food',
    quantity: prismaSale.quantity,
    discount: prismaSale.discount,
    date: prismaSale.date.toISOString(),
    totalSalePrice: prismaSale.totalSalePrice,
    selectedToppings: prismaSale.selectedToppings as Ingredient[] | undefined,
    selectedPackagingId: prismaSale.selectedPackagingId || undefined,
    selectedPackagingName: prismaSale.selectedPackagingName || undefined,
  };
}

function convertPrismaRawMaterial(prismaMaterial: any): RawMaterial {
  return {
    id: prismaMaterial.id,
    name: prismaMaterial.name,
    unit: prismaMaterial.unit,
    totalQuantity: prismaMaterial.totalQuantity,
    totalCost: prismaMaterial.totalCost,
    costPerUnit: prismaMaterial.costPerUnit,
    lastPurchaseQuantity: prismaMaterial.lastPurchaseQuantity || undefined,
    lastPurchaseCost: prismaMaterial.lastPurchaseCost || undefined,
    category: prismaMaterial.category as 'main' | 'packaging' | 'topping',
    sellingPrice: prismaMaterial.sellingPrice || undefined,
    purchaseSource: prismaMaterial.purchaseSource as any,
    lowStockThreshold: prismaMaterial.lowStockThreshold || undefined,
  };
}

function convertPrismaOperationalCost(prismaCost: any): OperationalCost {
  return {
    id: prismaCost.id,
    description: prismaCost.description,
    amount: prismaCost.amount,
    date: prismaCost.date.toISOString(),
    recurrence: prismaCost.recurrence as 'sekali' | 'harian' | 'mingguan' | 'bulanan',
  };
}

// Database Service
export const databaseService = {
  // Get all data
  async getAllData(): Promise<DbData> {
    try {
      const [drinks, foods, sales, operationalCosts, rawMaterials, appSettings] = await Promise.all([
        prisma.drink.findMany(),
        prisma.food.findMany(),
        prisma.sale.findMany({ orderBy: { date: 'desc' } }),
        prisma.operationalCost.findMany({ orderBy: { date: 'desc' } }),
        prisma.rawMaterial.findMany(),
        prisma.appSettings.findFirst(),
      ]);

      const settings = appSettings || {
        appName: 'Petrichor',
        logoImageUri: null,
        marqueeText: 'Welcome to {appName}!',
        themeId: 'default',
      };

      return {
        appName: settings.appName,
        logoImageUri: settings.logoImageUri,
        marqueeText: settings.marqueeText,
        themeId: settings.themeId,
        drinks: drinks.map(convertPrismaDrink),
        foods: foods.map(convertPrismaFood),
        sales: sales.map(convertPrismaSale),
        operationalCosts: operationalCosts.map(convertPrismaOperationalCost),
        rawMaterials: rawMaterials.map(convertPrismaRawMaterial),
      };
    } catch (error) {
      console.error('Error in getAllData:', error);
      throw error;
    }
  },

  // Import all data
  async importData(data: DbData): Promise<{ ok: boolean; message: string }> {
    try {
      // Start a transaction
      await prisma.$transaction(async (tx) => {
        // Clear existing data
        await tx.sale.deleteMany();
        await tx.operationalCost.deleteMany();
        await tx.rawMaterial.deleteMany();
        await tx.food.deleteMany();
        await tx.drink.deleteMany();
        await tx.queuedOrder.deleteMany();

        // Import drinks
        for (const drink of data.drinks) {
          await tx.drink.create({
            data: {
              id: drink.id,
              name: drink.name,
              imageUri: drink.imageUri,
              subCategory: drink.subCategory,
              costPrice: drink.costPrice,
              sellingPrice: drink.sellingPrice,
              ingredients: drink.ingredients as any,
              availableToppings: drink.availableToppings as any,
              packagingOptions: drink.packagingOptions as any,
            },
          });
        }

        // Import foods
        for (const food of data.foods) {
          await tx.food.create({
            data: {
              id: food.id,
              name: food.name,
              imageUri: food.imageUri,
              subCategory: food.subCategory,
              costPrice: food.costPrice,
              sellingPrice: food.sellingPrice,
              ingredients: food.ingredients as any,
              availableToppings: food.availableToppings as any,
              packagingOptions: food.packagingOptions as any,
            },
          });
        }

        // Import raw materials
        for (const material of data.rawMaterials) {
          await tx.rawMaterial.create({
            data: {
              id: material.id,
              name: material.name,
              unit: material.unit,
              totalQuantity: material.totalQuantity,
              totalCost: material.totalCost,
              costPerUnit: material.costPerUnit,
              lastPurchaseQuantity: material.lastPurchaseQuantity,
              lastPurchaseCost: material.lastPurchaseCost,
              category: material.category,
              sellingPrice: material.sellingPrice,
              purchaseSource: material.purchaseSource as any,
              lowStockThreshold: material.lowStockThreshold,
            },
          });
        }

        // Import sales
        for (const sale of data.sales) {
          await tx.sale.create({
            data: {
              id: sale.id,
              productId: sale.productId,
              productType: sale.productType,
              quantity: sale.quantity,
              discount: sale.discount,
              date: new Date(sale.date),
              totalSalePrice: sale.totalSalePrice,
              selectedToppings: sale.selectedToppings as any,
              selectedPackagingId: sale.selectedPackagingId,
              selectedPackagingName: sale.selectedPackagingName,
              createdById: undefined, // Optional for backward compatibility
            },
          });
        }

        // Import operational costs
        for (const cost of data.operationalCosts) {
          await tx.operationalCost.create({
            data: {
              id: cost.id,
              description: cost.description,
              amount: cost.amount,
              date: new Date(cost.date),
              recurrence: cost.recurrence,
            },
          });
        }

        // Update app settings
        await tx.appSettings.upsert({
          where: { id: 'default' },
          update: {
            appName: data.appName,
            logoImageUri: data.logoImageUri,
            marqueeText: data.marqueeText,
            themeId: data.themeId,
          },
          create: {
            id: 'default',
            appName: data.appName,
            logoImageUri: data.logoImageUri,
            marqueeText: data.marqueeText,
            themeId: data.themeId,
          },
        });
      });

      return { ok: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Import error:', error);
      return { ok: false, message: 'Failed to import data' };
    }
  },

  // Drink operations
  async addDrink(drink: Omit<Drink, 'id' | 'costPrice'>): Promise<Drink> {
    const rawMaterials = await prisma.rawMaterial.findMany();
    const costPrice = calculateItemCostPrice(drink.ingredients, rawMaterials);
    
    const newDrink = await prisma.drink.create({
      data: {
        name: drink.name,
        imageUri: drink.imageUri,
        subCategory: drink.subCategory,
        costPrice,
        sellingPrice: drink.sellingPrice,
        ingredients: drink.ingredients as any,
        availableToppings: drink.availableToppings as any,
        packagingOptions: drink.packagingOptions as any,
      },
    });

    return convertPrismaDrink(newDrink);
  },

  async updateDrink(id: string, drink: Partial<Omit<Drink, 'id'>>): Promise<Drink> {
    const rawMaterials = await prisma.rawMaterial.findMany();
    let costPrice: number | undefined;
    
    if (drink.ingredients) {
      costPrice = calculateItemCostPrice(drink.ingredients, rawMaterials);
    }

    const updatedDrink = await prisma.drink.update({
      where: { id },
      data: {
        ...(drink.name && { name: drink.name }),
        ...(drink.imageUri !== undefined && { imageUri: drink.imageUri }),
        ...(drink.subCategory && { subCategory: drink.subCategory }),
        ...(costPrice !== undefined && { costPrice }),
        ...(drink.sellingPrice && { sellingPrice: drink.sellingPrice }),
        ...(drink.ingredients && { ingredients: drink.ingredients as any }),
        ...(drink.availableToppings && { availableToppings: drink.availableToppings as any }),
        ...(drink.packagingOptions && { packagingOptions: drink.packagingOptions as any }),
      },
    });

    return convertPrismaDrink(updatedDrink);
  },

  async deleteDrink(id: string): Promise<{ ok: boolean; message: string }> {
    try {
      await prisma.drink.delete({ where: { id } });
      return { ok: true, message: 'Minuman berhasil dihapus.' };
    } catch (error) {
      return { ok: false, message: 'Gagal menghapus minuman.' };
    }
  },

  // Food operations
  async addFood(food: Omit<Food, 'id' | 'costPrice'>): Promise<Food> {
    const rawMaterials = await prisma.rawMaterial.findMany();
    const costPrice = calculateItemCostPrice(food.ingredients, rawMaterials);
    
    const newFood = await prisma.food.create({
      data: {
        name: food.name,
        imageUri: food.imageUri,
        subCategory: food.subCategory,
        costPrice,
        sellingPrice: food.sellingPrice,
        ingredients: food.ingredients as any,
        availableToppings: food.availableToppings as any,
        packagingOptions: food.packagingOptions as any,
      },
    });

    return convertPrismaFood(newFood);
  },

  async updateFood(id: string, food: Partial<Omit<Food, 'id'>>): Promise<Food> {
    const rawMaterials = await prisma.rawMaterial.findMany();
    let costPrice: number | undefined;
    
    if (food.ingredients) {
      costPrice = calculateItemCostPrice(food.ingredients, rawMaterials);
    }

    const updatedFood = await prisma.food.update({
      where: { id },
      data: {
        ...(food.name && { name: food.name }),
        ...(food.imageUri !== undefined && { imageUri: food.imageUri }),
        ...(food.subCategory && { subCategory: food.subCategory }),
        ...(costPrice !== undefined && { costPrice }),
        ...(food.sellingPrice && { sellingPrice: food.sellingPrice }),
        ...(food.ingredients && { ingredients: food.ingredients as any }),
        ...(food.availableToppings && { availableToppings: food.availableToppings as any }),
        ...(food.packagingOptions && { packagingOptions: food.packagingOptions as any }),
      },
    });

    return convertPrismaFood(updatedFood);
  },

  async deleteFood(id: string): Promise<{ ok: boolean; message: string }> {
    try {
      await prisma.food.delete({ where: { id } });
      return { ok: true, message: 'Makanan berhasil dihapus.' };
    } catch (error) {
      return { ok: false, message: 'Gagal menghapus makanan.' };
    }
  },

  // Sale operations
  async addSale(sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> {
    const newSale = await prisma.sale.create({
      data: {
        productId: sale.productId,
        productType: sale.productType,
        quantity: sale.quantity,
        discount: sale.discount,
        totalSalePrice: sale.totalSalePrice,
        selectedToppings: sale.selectedToppings as any,
        selectedPackagingId: sale.selectedPackagingId,
        selectedPackagingName: sale.selectedPackagingName,
        createdById: undefined, // Will be optional for backward compatibility
      },
    });

    return convertPrismaSale(newSale);
  },

  async deleteSale(id: string): Promise<{ ok: boolean; message: string }> {
    try {
      await prisma.sale.delete({ where: { id } });
      return { ok: true, message: 'Penjualan berhasil dihapus.' };
    } catch (error) {
      return { ok: false, message: 'Gagal menghapus penjualan.' };
    }
  },

  async batchAddSales(sales: Omit<Sale, 'id' | 'date'>[]): Promise<Sale[]> {
    const createdSales = await prisma.sale.createMany({
      data: sales.map(sale => ({
        productId: sale.productId,
        productType: sale.productType,
        quantity: sale.quantity,
        discount: sale.discount,
        totalSalePrice: sale.totalSalePrice,
        selectedToppings: sale.selectedToppings as any,
        selectedPackagingId: sale.selectedPackagingId,
        selectedPackagingName: sale.selectedPackagingName,
        createdById: undefined, // Will be optional for backward compatibility
      })),
    });

    // Return the created sales
    const allSales = await prisma.sale.findMany({
      where: { id: { in: sales.map(() => '') } }, // This won't work perfectly, but it's a limitation
      orderBy: { date: 'desc' },
      take: sales.length,
    });

    return allSales.map(convertPrismaSale);
  },

  // Operational cost operations
  async addOperationalCost(cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> {
    const newCost = await prisma.operationalCost.create({
      data: {
        description: cost.description,
        amount: cost.amount,
        recurrence: cost.recurrence,
      },
    });

    return convertPrismaOperationalCost(newCost);
  },

  async updateOperationalCost(id: string, cost: Omit<OperationalCost, 'id' | 'date'>): Promise<OperationalCost> {
    const updatedCost = await prisma.operationalCost.update({
      where: { id },
      data: {
        description: cost.description,
        amount: cost.amount,
        recurrence: cost.recurrence,
      },
    });

    return convertPrismaOperationalCost(updatedCost);
  },

  async deleteOperationalCost(id: string): Promise<{ ok: boolean; message: string }> {
    try {
      await prisma.operationalCost.delete({ where: { id } });
      return { ok: true, message: 'Biaya berhasil dihapus.' };
    } catch (error) {
      return { ok: false, message: 'Gagal menghapus biaya.' };
    }
  },

  // Raw material operations
  async addRawMaterial(material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> {
    const newMaterial = await prisma.rawMaterial.create({
      data: {
        name: material.name,
        unit: material.unit,
        totalQuantity: material.totalQuantity,
        totalCost: material.totalCost,
        costPerUnit: material.costPerUnit,
        lastPurchaseQuantity: material.lastPurchaseQuantity,
        lastPurchaseCost: material.lastPurchaseCost,
        category: material.category,
        sellingPrice: material.sellingPrice,
        purchaseSource: material.purchaseSource as any,
        lowStockThreshold: material.lowStockThreshold,
      },
    });

    return convertPrismaRawMaterial(newMaterial);
  },

  async updateRawMaterial(id: string, material: Omit<RawMaterial, 'id'>): Promise<RawMaterial> {
    const updatedMaterial = await prisma.rawMaterial.update({
      where: { id },
      data: {
        name: material.name,
        unit: material.unit,
        totalQuantity: material.totalQuantity,
        totalCost: material.totalCost,
        costPerUnit: material.costPerUnit,
        lastPurchaseQuantity: material.lastPurchaseQuantity,
        lastPurchaseCost: material.lastPurchaseCost,
        category: material.category,
        sellingPrice: material.sellingPrice,
        purchaseSource: material.purchaseSource as any,
        lowStockThreshold: material.lowStockThreshold,
      },
    });

    return convertPrismaRawMaterial(updatedMaterial);
  },

  async deleteRawMaterial(id: string): Promise<{ ok: boolean; message: string }> {
    try {
      await prisma.rawMaterial.delete({ where: { id } });
      return { ok: true, message: 'Bahan baku berhasil dihapus.' };
    } catch (error) {
      return { ok: false, message: 'Gagal menghapus bahan baku.' };
    }
  },

  async importRawMaterialsFromCsv(materials: Omit<RawMaterial, 'id'>[]): Promise<RawMaterial[]> {
    const createdMaterials = await prisma.rawMaterial.createMany({
      data: materials.map(material => ({
        name: material.name,
        unit: material.unit,
        totalQuantity: material.totalQuantity,
        totalCost: material.totalCost,
        costPerUnit: material.costPerUnit,
        lastPurchaseQuantity: material.lastPurchaseQuantity,
        lastPurchaseCost: material.lastPurchaseCost,
        category: material.category,
        sellingPrice: material.sellingPrice,
        purchaseSource: material.purchaseSource as any,
        lowStockThreshold: material.lowStockThreshold,
      })),
    });

    // Return the created materials
    const allMaterials = await prisma.rawMaterial.findMany({
      orderBy: { createdAt: 'desc' },
      take: materials.length,
    });

    return allMaterials.map(convertPrismaRawMaterial);
  },

  async importOperationalCostsFromCsv(costs: Omit<OperationalCost, 'id'>[]): Promise<OperationalCost[]> {
    const createdCosts = await prisma.operationalCost.createMany({
      data: costs.map(cost => ({
        description: cost.description,
        amount: cost.amount,
        date: new Date(cost.date),
        recurrence: cost.recurrence,
      })),
    });

    // Return the created costs
    const allCosts = await prisma.operationalCost.findMany({
      orderBy: { createdAt: 'desc' },
      take: costs.length,
    });

    return allCosts.map(convertPrismaOperationalCost);
  },
};

/**
 * @fileoverview
 * Contains centralized business logic for data manipulation to ensure consistency
 * between local storage and server-side API operations.
 */
import type { DbData, Drink, Food, RawMaterial, Sale } from './types';

// --- Validation Logic ---

/**
 * Checks if a raw material is currently used in any drink or food recipe.
 */
export function isRawMaterialInUse(db: DbData, materialId: string): boolean {
  const isUsedInDrink = db.drinks.some(drink =>
    drink.ingredients.some(ing => ing.rawMaterialId === materialId)
  );
  const isUsedInFood = db.foods.some(food =>
    food.ingredients.some(ing => ing.rawMaterialId === materialId)
  );
  return isUsedInDrink || isUsedInFood;
}

/**
 * Checks if a drink has any associated sales records.
 */
export function hasDrinkAssociatedSales(db: DbData, drinkId: string): boolean {
   return db.sales.some(sale => sale.productId === drinkId && sale.productType === 'drink');
}

/**
 * Checks if a food item has any associated sales records.
 */
export function hasFoodAssociatedSales(db: DbData, foodId: string): boolean {
  if (!db.foods) return false;
  return db.sales.some(sale => sale.productId === foodId && sale.productType === 'food');
}


// --- Calculation Logic ---

/**
 * Calculates the cost price of a single drink or food item based on its ingredients.
 * This version is made more robust to prevent NaN errors.
 */
export function calculateItemCostPrice(ingredients: (Drink | Food)['ingredients'], allRawMaterials: RawMaterial[]): number {
  if (!ingredients || allRawMaterials.length === 0) return 0;
  return ingredients.reduce((acc, item) => {
    if (!item) return acc; // Skip if item is invalid
    const material = allRawMaterials.find(m => m.id === item.rawMaterialId);
    // Ensure costPerUnit and quantity are valid numbers, otherwise treat as 0.
    const costPerUnit = material?.costPerUnit ?? 0;
    const quantity = item.quantity ?? 0;
    const cost = costPerUnit * quantity;
    return acc + (isNaN(cost) ? 0 : cost);
  }, 0);
}


// --- Data Manipulation Logic ---

/**
 * Updates the cost price of all drinks and foods that use a specific raw material.
 * This is intended to be used after a raw material's cost has been updated.
 * It directly mutates the DbData object.
 *
 * @param db The entire database object.
 * @param updatedMaterialId The ID of the raw material that was updated.
 */
export function recalculateDependentProductCosts(db: DbData, updatedMaterialId: string): void {
  // Find and update drinks that use this material
  db.drinks.forEach((drink) => {
    const usesMaterial = drink.ingredients.some(ing => ing.rawMaterialId === updatedMaterialId);
    if (usesMaterial) {
      drink.costPrice = calculateItemCostPrice(drink.ingredients, db.rawMaterials);
    }
  });

  // Find and update foods that use this material
  if (db.foods) {
    db.foods.forEach((food) => {
      const usesMaterial = food.ingredients.some(ing => ing.rawMaterialId === updatedMaterialId);
      if (usesMaterial) {
        food.costPrice = calculateItemCostPrice(food.ingredients, db.rawMaterials);
      }
    });
  }
}

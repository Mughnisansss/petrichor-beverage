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
  return db.sales.some(sale => sale.drinkId === drinkId);
}


// --- Calculation Logic ---

/**
 * Calculates the cost price of a single drink or food item based on its ingredients.
 */
export function calculateItemCostPrice(ingredients: (Drink | Food)['ingredients'], allRawMaterials: RawMaterial[]): number {
  if (!ingredients || allRawMaterials.length === 0) return 0;
  return ingredients.reduce((acc, item) => {
    const material = allRawMaterials.find(m => m.id === item.rawMaterialId);
    const cost = material ? material.costPerUnit * item.quantity : 0;
    return acc + cost;
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

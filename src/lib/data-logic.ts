
/**
 * @fileoverview
 * Contains centralized business logic for data manipulation to ensure consistency
 * between local storage and server-side API operations.
 */
import type { DbData, Drink, Food, OperationalCost, RawMaterial, Sale } from './types';
import { differenceInDays, isWithinInterval, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

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
    if (!item || !item.rawMaterialId) return acc; // Skip if item is invalid
    const material = allRawMaterials.find(m => m.id === item.rawMaterialId);
    // Ensure costPerUnit and quantity are valid numbers, otherwise treat as 0.
    const costPerUnit = material?.costPerUnit ?? 0;
    const quantity = item.quantity ?? 0;
    const cost = costPerUnit * quantity;
    return acc + (isNaN(cost) ? 0 : cost);
  }, 0);
}

/**
 * Calculates the total Cost of Goods Sold (HPP) for a single sale transaction.
 * This function is robust and handles missing data gracefully.
 */
export function calculateSaleHpp(sale: Sale, drinks: Drink[], foods: Food[], rawMaterials: RawMaterial[]): number {
  if (!sale) return 0;

  const { productId, productType, selectedToppings, selectedPackagingId, quantity } = sale;
  const product = productType === 'drink'
    ? drinks.find(d => d.id === productId)
    : foods.find(f => f.id === productId);

  if (!product) {
    return 0; // Product not found, HPP is 0 for this sale.
  }

  // 1. Start with the product's base cost price.
  let singleItemCost = product.costPrice || 0;

  // 2. Add cost of packaging for the selected size.
  if (selectedPackagingId && product.packagingOptions) {
    const packaging = product.packagingOptions.find(p => p.id === selectedPackagingId);
    if (packaging && packaging.ingredients) {
      const packagingCost = calculateItemCostPrice(packaging.ingredients, rawMaterials);
      singleItemCost += packagingCost || 0;
    }
  }

  // 3. Add cost of selected toppings.
  if (selectedToppings && selectedToppings.length > 0) {
    const toppingsCost = calculateItemCostPrice(selectedToppings, rawMaterials);
    singleItemCost += toppingsCost || 0;
  }

  // 4. Multiply by quantity.
  const totalCostForSale = (singleItemCost || 0) * (quantity || 0);
  
  return isNaN(totalCostForSale) ? 0 : totalCostForSale;
}

/**
 * Calculates the total operational cost for a given date period, accounting for recurring costs.
 */
export function calculateOperationalCostForPeriod(period: DateRange, allCosts: OperationalCost[]): number {
  if (!period.from || !period.to) return 0;

  // 1. Calculate one-time costs that fall within the period.
  const oneTimeCosts = allCosts
    .filter(c => c.recurrence === 'sekali' && isWithinInterval(parseISO(c.date), { start: period.from!, end: period.to! }))
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  // 2. Calculate the total daily rate for all recurring costs active *before the end of the period*.
  const totalDailyRate = allCosts
    .filter(c => c.recurrence !== 'sekali' && parseISO(c.date) <= period.to!)
    .reduce((sum, c) => {
      const amount = c.amount || 0;
      if (c.recurrence === 'harian') return sum + amount;
      if (c.recurrence === 'mingguan') return sum + (amount / 7);
      if (c.recurrence === 'bulanan') return sum + (amount / 30);
      return sum;
    }, 0);

  // 3. Multiply the daily rate by the number of days in the period.
  const numberOfDays = differenceInDays(period.to, period.from) + 1;
  const totalRecurringCost = totalDailyRate * numberOfDays;

  const totalCost = oneTimeCosts + totalRecurringCost;
  return isNaN(totalCost) ? 0 : totalCost;
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

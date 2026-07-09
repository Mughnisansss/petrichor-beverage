# Petrichor - System Flow Diagrams

## Main Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                 │
│                         (Next.js Pages + Components)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ User Actions
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MAIN LAYOUT COMPONENT                             │
│                    (Navigation, Header, Route Handling)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │   DASHBOARD      │  │   POS SYSTEM     │  │   PRODUCT MGMT   │
        │   (/)            │  │   (/kasir)       │  │   (/racik)       │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────┐
        │                    APP CONTEXT                            │
        │              (Centralized State Management)               │
        │  ┌────────────────────────────────────────────────────┐  │
        │  │  • drinks, foods, sales, rawMaterials              │  │
        │  │  • operationalCosts, appSettings                    │  │
        │  │  • CRUD operations for all entities                 │  │
        │  │  • Business logic coordination                      │  │
        │  └────────────────────────────────────────────────────┘  │
        └──────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
        ┌──────────────────────────┐        ┌──────────────────────────┐
        │   LOCAL STORAGE MODE     │        │     SERVER MODE           │
        │   (localStorage API)      │        │   (REST API Calls)        │
        └──────────────────────────┘        └──────────────────────────┘
                    │                                       │
                    ▼                                       ▼
        ┌──────────────────┐                ┌──────────────────────────┐
        │  Browser Storage  │                │  Next.js API Routes       │
        │  (Persistent)     │                │  (/api/* endpoints)       │
        └──────────────────┘                └──────────────────────────┘
                                                    │
                                                    ▼
                                        ┌──────────────────┐
                                        │     db.json      │
                                        │  (File Database) │
                                        └──────────────────┘
```

## Product Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER: CREATE NEW PRODUCT                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PRODUCT FORM (/racik/minuman or /racik/makanan)            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Input Fields:                                                        │   │
│  │  • Product Name                                                       │   │
│  │  • Base Selling Price                                                 │   │
│  │  • Category/Subcategory                                               │   │
│  │  • Image (optional)                                                    │   │
│  │  • Ingredients (select from raw materials)                           │   │
│  │  • Available Toppings (optional)                                      │   │
│  │  • Packaging Options (optional)                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ User submits form
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AppContext.addDrink() / addFood()                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │   COST CALCULATION           │      │   ID GENERATION              │
    │   calculateItemCostPrice()   │      │   nanoid()                    │
    │                              │      │                              │
    │   For each ingredient:       │      │   Generate unique ID         │
    │   cost += material.costPerUnit│     │   for new product            │
    │           × ingredient.qty   │      │                              │
    └──────────────────────────────┘      └──────────────────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                    ┌──────────────────────────────┐
                    │   Create Product Object      │
                    │   {                          │
                    │     id: generatedId,         │
                    │     name: inputName,         │
                    │     ingredients: [...],      │
                    │     costPrice: calculated,   │
                    │     sellingPrice: inputPrice │
                    │   }                          │
                    └──────────────────────────────┘
                                        │
                                        ▼
                    ┌──────────────────────────────┐
                    │   STORAGE OPERATION           │
                    └──────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │   LOCAL MODE                 │      │   SERVER MODE                 │
    │   localStorage.setItem()     │      │   POST /api/drinks             │
    │   Update localStorage        │      │   or POST /api/foods           │
    │   Trigger re-render          │      │   Update db.json               │
    └──────────────────────────────┘      └──────────────────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                    ┌──────────────────────────────┐
                    │   SUCCESS NOTIFICATION        │
                    │   Product created successfully│
                    └──────────────────────────────┘
```

## Sale Transaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CUSTOMER ORDER PROCESS                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │   CUSTOMER VIEW │  │   POS QUICK SALE│  │   POS ORDER QUEUE│
        │   (/order)       │  │   (/kasir/cepat) │  │   (/kasir/orderan)│
        └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │                   │                   │
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                   CART MANAGEMENT                             │
        │  ┌────────────────────────────────────────────────────────┐  │
        │  │  CartItem[]:                                            │  │
        │  │  • productId, productType                              │  │
        │  │  • quantity, sellingPrice                               │  │
        │  │  • selectedToppings[]                                   │  │
        │  │  • selectedPackagingId                                  │  │
        │  └────────────────────────────────────────────────────────┘  │
        └──────────────────────────────────────────────────────────────┘
                                        │
                                        │ User confirms order
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    CHECKOUT PROCESS                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │   PRICE CALCULATION  │  │   STOCK DEDUCTION    │  │   SALE RECORDING     │
    │                      │  │                      │  │                      │
    │   Base Price         │  │   deductStockForSale  │  │   Create Sale[]      │
    │   + Toppings Cost    │  │   Items()             │  │   • productId        │
    │   + Packaging Cost   │  │                      │  │   • quantity         │
    │   × Quantity         │  │   Deduct from:        │  │   • totalSalePrice   │
    │   - Discount         │  │   • Base ingredients  │  │   • discount         │
    │                      │  │   • Packaging         │  │   • date             │
    │                      │  │   • Toppings          │  │   • selectedOptions  │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    STORAGE OPERATION                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │   LOCAL MODE                 │      │   SERVER MODE                 │
    │   localStorage.setItem()     │      │   POST /api/sales             │
    │   Update sales[]             │      │   or POST /api/sales/bulk     │
    │   Update rawMaterials[]     │      │   Update db.json              │
    │   (stock quantities)         │      │   (sales + rawMaterials)     │
    └──────────────────────────────┘      └──────────────────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    ORDER CONFIRMATION                         │
        │  • Display order summary                                       │
        │  • Show receipt/confirmation                                   │
        │  • Clear cart                                                  │
        │  • Update UI to reflect changes                                │
        └──────────────────────────────────────────────────────────────┘
```

## Analytics Calculation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ANALYTICS DASHBOARD (/analisa)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ User selects date range
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    DATA RETRIEVAL                             │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │   SALES DATA         │  │   COST DATA          │  │   OPERATIONAL DATA   │
    │   sales[]            │  │   drinks[] + foods[] │  │   operationalCosts[] │
    │   Filter by date     │  │   rawMaterials[]     │  │   Filter by date     │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    METRIC CALCULATIONS                         │
        └──────────────────────────────────────────────────────────────┘
                                        │
    ┌──────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │  REVENUE CALCULATION:                                              │
    │  • Total Revenue = Σ(sale.totalSalePrice)                          │
    │  • Gross Revenue = Total Revenue - Discounts                       │
    │                                                                    │
    │  COST CALCULATION:                                                 │
    │  • HPP (COGS) = Σ(calculateSaleHpp())                              │
    │    - Base product cost                                            │
    │    - Packaging cost                                               │
    │    - Toppings cost                                                 │
    │                                                                    │
    │  OPERATIONAL COSTS:                                                │
    │  • Total Ops Cost = calculateOperationalCostForPeriod()           │
    │    - One-time costs in period                                     │
    │    - Recurring costs (daily/weekly/monthly)                        │
    │                                                                    │
    │  PROFIT CALCULATION:                                               │
    │  • Gross Profit = Revenue - HPP                                   │
    │  • Net Profit = Gross Profit - Operational Costs                  │
    │  • Profit Margin = (Net Profit / Revenue) × 100                   │
    │                                                                    │
    └──────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    VISUALIZATION                              │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │   SUMMARY CARDS      │  │   CHARTS             │  │   DETAILED REPORTS   │
    │   • Total Revenue     │  │   • Revenue trends   │  │   • Transaction list  │
    │   • Net Profit        │  │   • Cost breakdown   │  │   • Cost analysis    │
    │   • HPP               │  │   • Profit margins   │  │   • Export options   │
    │   • Operational Costs │  │   • Top products     │  │                      │
    └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

## Inventory Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RAW MATERIAL MANAGEMENT (/racik/bahan-baku)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │   ADD MATERIAL    │  │   UPDATE STOCK   │  │   DELETE MATERIAL │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    VALIDATION & LOGIC                          │
        └──────────────────────────────────────────────────────────────┘
                                        │
    ┌──────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │  ADD MATERIAL:                                                     │
    │  • Check for duplicates                                            │
    │  • Calculate weighted average cost if stock exists                 │
    │  • Set initial quantity and cost                                   │
    │                                                                    │
    │  UPDATE STOCK:                                                     │
    │  • Calculate new weighted average:                                 │
    │    newCostPerUnit = (oldTotalCost + newCost) /                     │
    │                      (oldQuantity + newQuantity)                   │
    │  • Update totalQuantity and totalCost                              │
    │  • Trigger recalculateDependentProductCosts() if price changed     │
    │                                                                    │
    │  DELETE MATERIAL:                                                  │
    │  • Check isRawMaterialInUse() - prevent if used in recipes         │
    │  • Check for associated sales history                              │
    │  • Allow deletion only if safe                                     │
    │                                                                    │
    └──────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    STORAGE OPERATION                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │   LOCAL MODE                 │      │   SERVER MODE                 │
    │   localStorage.setItem()     │      │   PUT /api/bahan-baku/{id}     │
    │   Update rawMaterials[]     │      │   DELETE /api/bahan-baku/{id}  │
    │   Update dependent products │      │   Update db.json              │
    └──────────────────────────────┘      └──────────────────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    UI UPDATE                                    │
        │  • Refresh material list                                       │
        │  • Update product cost prices if changed                        │
        │  • Show low stock warnings if below threshold                   │
        └──────────────────────────────────────────────────────────────┘
```

## Cost Price Propagation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              RAW MATERIAL COST UPDATE TRIGGER                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ User updates material cost
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │            AppContext.updateRawMaterial()                     │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
    │   UPDATE MATERIAL    │  │   DETECT DEPENDENT   │  │   RECALCULATE COSTS   │
    │   • new costPerUnit  │  │   PRODUCTS           │  │   For each dependent │
    │   • new totalCost    │  │   • Find drinks      │  │   product:            │
    │   • new totalQuantity│  │     using material   │  │   • New costPrice =   │
    └──────────────────────┘  │   • Find foods       │  │     calculateItemCost │
                               │     using material   │  │       Price()        │
                               └──────────────────────┘  └──────────────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    PROPAGATION CHAIN                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
    Material Cost Changed
            │
            ├─→ Drink A (uses material) → Cost price updated
            │                                           │
            │                                           └─→ Sales using Drink A
            │                                                   │
            │                                                   └─→ HPP recalculated
            │
            ├─→ Drink B (uses material) → Cost price updated
            │                                           │
            │                                           └─→ Sales using Drink B
            │                                                   │
            │                                                   └─→ HPP recalculated
            │
            ├─→ Food X (uses material) → Cost price updated
            │                                           │
            │                                           └─→ Sales using Food X
            │                                                   │
            │                                                   └─→ HPP recalculated
            │
            └─→ (repeat for all dependent products)
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    STORAGE OPERATION                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │   LOCAL MODE                 │      │   SERVER MODE                 │
    │   localStorage.setItem()     │      │   PUT /api/bahan-baku/{id}    │
    │   Update rawMaterials[]     │      │   PUT /api/drinks/{id} (each) │
    │   Update drinks[]           │      │   PUT /api/foods/{id} (each)  │
    │   Update foods[]            │      │   Update db.json              │
    └──────────────────────────────┘      └──────────────────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    UI REFRESH                                   │
        │  • Show updated costs in product management                     │
        │  • Update profit margins in analytics                          │
        │  • Refresh all displays showing cost/price data                │
        └──────────────────────────────────────────────────────────────┘
```

## Data Import/Export Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA MANAGEMENT (/pengaturan/data)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │   EXPORT DATA     │  │   IMPORT JSON    │  │   IMPORT CSV      │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │                   │                   │
                    ▼                   ▼                   ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    DATA PROCESSING                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
    ┌──────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │  EXPORT:                                                           │
    │  • Collect all data from AppContext                              │
    │  • Format as JSON or CSV                                          │
    │  • Generate downloadable file                                     │
    │                                                                    │
    │  IMPORT JSON:                                                      │
    │  • Parse JSON file                                                │
    │  • Validate structure (all required arrays present)               │
    │  • Merge with existing data or replace completely                 │
    │  • Update AppContext state                                        │
    │                                                                    │
    │  IMPORT CSV:                                                       │
    │  • Parse CSV file (papaparse)                                     │
    │  • Map columns to data structure                                  │
    │  • Validate data types                                            │
    │  • Import to specific collection (raw materials, operational costs)│
    │  • Update AppContext state                                        │
    │                                                                    │
    └──────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    STORAGE OPERATION                           │
        └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌──────────────────────────────┐      ┌──────────────────────────────┐
    │   LOCAL MODE                 │      │   SERVER MODE                 │
    │   localStorage.setItem()     │      │   POST /api/import            │
    │   Replace/update all data    │      │   Update db.json              │
    └──────────────────────────────┘      └──────────────────────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    COMPLETION                                 │
        │  • Show success/failure notification                          │
        │  • Refresh UI with new data                                   │
        │  • Provide summary of changes made                             │
        └──────────────────────────────────────────────────────────────┘
```
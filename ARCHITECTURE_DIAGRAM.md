# Petrichor - Architecture Diagram & System Overview

## Project Overview
**Petrichor** is a comprehensive cafe/beverage management system built with Next.js 15, TypeScript, and React. It provides POS functionality, inventory management, recipe management with automatic cost calculation, and business analytics.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                           │
│                    (Next.js 15 + React 18)                        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APP CONTEXT LAYER                          │
│                    (React Context + Hooks)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         AppContext.tsx - State Management               │  │
│  │  • Storage Mode Switching (Local/Server)                  │  │
│  │  • Data CRUD Operations                                   │  │
│  │  • Business Logic Coordination                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│   LOCAL STORAGE MODE        │    │   SERVER MODE (API)         │
│   (Browser localStorage)     │    │   (Next.js API Routes)      │
└──────────────────────────────┘    └──────────────────────────────┘
                    │                               │
                    ▼                               ▼
            ┌───────────────┐              ┌───────────────┐
            │ localStorage  │              │   db.json     │
            │   (Browser)   │              │  (File-based) │
            └───────────────┘              └───────────────┘
```

## Core System Components

### 1. Frontend Layer (Next.js App Router)

```
src/app/
├── layout.tsx              # Root layout with AppProvider wrapper
├── page.tsx                # Landing page with feature overview
├── globals.css             # Global styles
│
├── analisa/                # Analytics Dashboard
│   ├── page.tsx           # Financial metrics, charts, reports
│   └── layout.tsx
│
├── kasir/                  # POS System
│   ├── cepat/             # Quick sale mode
│   ├── orderan/           # Order queue management
│   ├── log/              # Sales history
│   └── layout.tsx
│
├── order/                  # Customer ordering interface
│   └── page.tsx           # Product catalog with customization
│
├── racik/                  # Product & Recipe Management
│   ├── minuman/           # Drink recipes
│   ├── makanan/           # Food recipes
│   └── bahan-baku/        # Raw material inventory
│
├── pengaturan/             # Settings & Configuration
│   ├── profil/            # App customization
│   ├── data/              # Data export/import
│   └── storage/           # Storage mode configuration
│
└── api/                    # RESTful API Routes (Server Mode)
    ├── drinks/            # Drink CRUD operations
    ├── foods/             # Food CRUD operations
    ├── sales/             # Sales recording
    ├── bahan-baku/        # Raw material management
    ├── operasional/       # Operational costs
    ├── import/            # Data import
    └── get-all-data/      # Full data export
```

### 2. State Management Layer

```
src/context/AppContext.tsx
├── Storage Mode Management
│   ├── Local Storage Service (localStorage)
│   └── API Service (RESTful calls to /api/*)
│
├── Data State
│   ├── drinks: Drink[]
│   ├── foods: Food[]
│   ├── sales: Sale[]
│   ├── operationalCosts: OperationalCost[]
│   ├── rawMaterials: RawMaterial[]
│   └── appSettings (appName, logo, marqueeText)
│
├── CRUD Operations
│   ├── addDrink, updateDrink, deleteDrink
│   ├── addFood, updateFood, deleteFood
│   ├── addSale, deleteSale, batchAddSales
│   ├── addRawMaterial, updateRawMaterial, deleteRawMaterial
│   └── addOperationalCost, updateOperationalCost, deleteOperationalCost
│
└── Business Logic Integration
    ├── Automatic cost price calculation
    ├── Stock deduction on sales
    ├── Dependent product cost recalculation
    └── Data validation
```

### 3. Business Logic Layer

```
src/lib/data-logic.ts
├── Validation Functions
│   ├── isRawMaterialInUse()      # Check if material used in recipes
│   ├── hasDrinkAssociatedSales() # Check if drink has sales history
│   └── hasFoodAssociatedSales()  # Check if food has sales history
│
├── Calculation Functions
│   ├── calculateItemCostPrice()       # Calculate HPP from ingredients
│   ├── calculateSaleHpp()             # Calculate COGS for sales
│   └── calculateOperationalCostForPeriod() # Calculate recurring costs
│
└── Data Manipulation Functions
    ├── recalculateDependentProductCosts() # Update costs when material prices change
    └── deductStockForSaleItems()         # Reduce inventory on sales
```

### 4. Data Models

```
src/lib/types.ts
├── Core Entities
│   ├── RawMaterial        # Inventory items with weighted average costing
│   ├── Drink              # Beverage products with recipes
│   ├── Food               # Food products with recipes
│   ├── Sale               # Transaction records
│   └── OperationalCost    # Business expenses (one-time/recurring)
│
├── Supporting Types
│   ├── Ingredient         # Recipe component (materialId + quantity)
│   ├── PackagingInfo      # Packaging options with costs
│   ├── CartItem           # Shopping cart items
│   └── QueuedOrder        # POS order queue management
│
└── Database Schema
    └── DbData             # Complete application state
```

### 5. Storage Layer

```
Dual Storage Architecture:

┌────────────────────────────────────────────────────────────┐
│                   STORAGE SELECTION                         │
│              (Configurable in Settings)                     │
└────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────────┐          ┌──────────────────────┐
│  LOCAL STORAGE MODE  │          │   SERVER MODE        │
├──────────────────────┤          ├──────────────────────┤
│ • Browser localStorage│          │ • File-based (db.json)│
│ • Persistent per device│         │ • Server-side API     │
│ • No server required  │          │ • Demo/testing only   │
│ • Offline capable     │          │ • Data lost on restart│
└──────────────────────┘          └──────────────────────┘
```

## Data Flow Diagrams

### Product Creation Flow

```
User Input (Recipe Form)
        │
        ▼
AppContext.addDrink/addFood()
        │
        ├─→ Calculate cost price (data-logic.ts)
        │   │
        │   └─→ calculateItemCostPrice(ingredients, rawMaterials)
        │       │
        │       └─→ Sum (material.costPerUnit × ingredient.quantity)
        │
        ├─→ Generate ID (nanoid)
        │
        └─→ Storage Operation
            │
            ├─→ Local Mode: localStorage.setItem()
            └─→ Server Mode: POST /api/drinks or /api/foods
```

### Sale Transaction Flow

```
User adds items to cart
        │
        ▼
Cart state management
        │
        ▼
Checkout
        │
        ├─→ Calculate final prices (base + toppings + packaging)
        │
        ├─→ Create Sale records
        │
        ├─→ deductStockForSaleItems()
        │   │
        │   ├─→ Deduct base product ingredients
        │   ├─→ Deduct packaging ingredients
        │   └─→ Deduct topping ingredients
        │
        └─→ Storage Operation
            │
            ├─→ Local Mode: localStorage.setItem()
            └─→ Server Mode: POST /api/sales
```

### Cost Price Update Propagation

```
User updates raw material cost
        │
        ▼
AppContext.updateRawMaterial()
        │
        ├─→ Update material cost (weighted average)
        │
        ├─→ recalculateDependentProductCosts()
        │   │
        │   ├─→ Find all drinks using this material
        │   ├─→ Recalculate drink cost prices
        │   ├─→ Find all foods using this material
        │   └─→ Recalculate food cost prices
        │
        └─→ Storage Operation
            │
            ├─→ Local Mode: localStorage.setItem()
            └─→ Server Mode: PUT /api/bahan-baku/{id}
```

## Component Hierarchy

```
AppProvider (Context)
    │
    ├─→ MainLayout
    │   │
    │   ├─→ Header (Navigation + Logo)
    │   ├─→ Main Content Area
    │   └─→ Toaster (Notifications)
    │
    ├─→ Dashboard Page (/)
    │   └─→ Feature Cards (links to main sections)
    │
    ├─→ POS System (/kasir)
    │   ├─→ Quick Sale Mode (/kasir/cepat)
    │   ├─→ Order Queue (/kasir/orderan)
    │   └─→ Sales Log (/kasir/log)
    │
    ├─→ Customer Order (/order)
    │   └─→ Product Catalog with customization
    │
    ├─→ Product Management (/racik)
    │   ├─→ Drink Recipes (/racik/minuman)
    │   ├─→ Food Recipes (/racik/makanan)
    │   └─→ Raw Materials (/racik/bahan-baku)
    │
    ├─→ Analytics (/analisa)
    │   └─→ Financial dashboard with charts
    │
    └─→ Settings (/pengaturan)
        ├─→ Profile customization
        ├─→ Data export/import
        └─→ Storage mode configuration
```

## Key Technical Patterns

### 1. Dual Storage Pattern
The application abstracts storage operations through a service pattern that switches between localStorage and API calls based on configuration.

### 2. Weighted Average Costing
Raw materials use weighted average costing: when new stock is added at different prices, the cost per unit is recalculated based on total cost ÷ total quantity.

### 3. Automatic Cost Propagation
When raw material costs change, the system automatically recalculates cost prices for all dependent products to maintain accurate margin calculations.

### 4. Client-Side State Management
All business logic runs client-side through React Context, with server-side API operations only used for persistence in server mode.

### 5. Type Safety
Comprehensive TypeScript types ensure data integrity throughout the application.

## External Dependencies

### UI Framework
- **Next.js 15.3.3**: React framework with App Router
- **React 18.3.1**: UI library
- **Radix UI**: Headless UI components
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Business Logic
- **date-fns**: Date manipulation for analytics
- **react-hook-form**: Form management
- **zod**: Schema validation
- **recharts**: Charting library for analytics
- **papaparse**: CSV import/export

### Utilities
- **nanoid**: Unique ID generation
- **clsx & tailwind-merge**: Class name utilities

## Deployment Architecture

```
Development: npm run dev (localhost:9002)
Production Build: npm run build
Production Start: npm start

Firebase Deployment (apphosting.yaml):
- Static Next.js export
- Firebase Hosting
- Firestore integration (optional)
```

## Security Considerations

- **No Authentication**: Single-instance application, no multi-user support
- **Client-Side Storage**: LocalStorage mode vulnerable to browser data clearing
- **Server Mode Limitations**: File-based database not suitable for production
- **No Server-Side Validation**: Business logic primarily client-side

## Future Enhancement Opportunities

1. **Backend Integration**: Replace file-based DB with proper database (PostgreSQL, MongoDB)
2. **Authentication**: Add user management and role-based access
3. **Real-time Updates**: WebSocket integration for multi-device sync
4. **Cloud Storage**: Replace localStorage with cloud database
5. **Payment Integration**: Add payment gateway support
6. **Receipt Printing**: Thermal printer integration
7. **Advanced Analytics**: More sophisticated reporting and forecasting

---

**Note**: This architecture is designed for single-instance deployment (small cafes, personal use). For multi-location or enterprise deployment, significant architectural changes would be required.
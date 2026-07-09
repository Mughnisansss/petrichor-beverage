# PostgreSQL + Prisma Backend Integration

## Overview
I've successfully integrated PostgreSQL with Prisma ORM into your Petrichor application, providing a production-ready backend solution with three storage mode options.

## What Was Implemented

### 1. Prisma Schema (`prisma/schema.prisma`)
Created a comprehensive database schema with:
- **AppSettings** - Application configuration
- **RawMaterial** - Inventory management with cost tracking
- **Drink** - Beverage products with recipes
- **Food** - Food products with recipes  
- **Sale** - Transaction records
- **OperationalCost** - Business expenses
- **QueuedOrder** - POS order management

### 2. Database Service Layer (`src/lib/database-service.ts`)
Complete service layer providing:
- CRUD operations for all entities
- Data import/export functionality
- Type conversion between Prisma and app types
- Transaction support for data integrity
- Error handling and logging

### 3. Prisma Client (`src/lib/prisma.ts`)
Singleton pattern for:
- Efficient connection management
- Development query logging
- Production error logging
- Connection pool optimization

### 4. Storage Mode Integration
Updated the app to support three storage modes:
- **Local Storage** - Browser localStorage (original)
- **File Database** - Server-side JSON file (original)
- **PostgreSQL Database** - Full database integration (new)

### 5. Storage Mode Selector UI
Created visual interface (`src/components/storage-mode-selector.tsx`) for:
- Easy mode switching
- Clear mode descriptions
- Feature comparison
- Setup guidance for database mode

### 6. Updated Dependencies
Added to `package.json`:
- `@prisma/client` - Prisma client library
- `prisma` - Prisma CLI
- `pg` - PostgreSQL driver
- New npm scripts for database operations

## How to Use

### Step 1: Set Up PostgreSQL

Choose one of these options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
psql -U postgres
CREATE DATABASE petrichor_db;
CREATE USER petrichor_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE petrichor_db TO petrichor_user;
```

#### Option B: Cloud PostgreSQL (Recommended)
- **Railway**: railway.app → New Project → PostgreSQL
- **Supabase**: supabase.com → New Project
- **Neon**: neon.tech → New Project

### Step 2: Configure Environment

Create a `.env` file in your project root:

```env
# For local PostgreSQL
DATABASE_URL="postgresql://petrichor_user:your_password@localhost:5432/petrichor_db"

# For Railway
# DATABASE_URL="postgresql://postgres:xxx@containers.us-east-1.railway.app:5432/railway"

# For Supabase  
# DATABASE_URL="postgresql://postgres.xxx@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Initialize Database
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### Step 5: Switch to Database Mode
1. Start your app: `npm run dev`
2. Navigate to **Settings → Storage** (`/pengaturan/storage`)
3. Select **PostgreSQL Database** mode
4. Your app will now use the database!

## Database Features

### Visual Database Management
```bash
npm run prisma:studio
```
Opens a web interface at `http://localhost:5555` to:
- View and edit data
- Create new records
- Explore relationships
- Run queries

### Automatic Migrations
```bash
npm run prisma:migrate
```
For production deployment with proper migration tracking.

### Data Export/Import
The database service supports:
- Full data export to JSON
- Data import from JSON
- CSV import for bulk operations
- Transaction support for data integrity

## Storage Mode Comparison

| Feature | Local Storage | File Database | PostgreSQL |
|---------|--------------|---------------|-------------|
| **Setup Required** | ❌ No | ❌ No | ✅ Yes |
| **Offline Capability** | ✅ Yes | ❌ No | ❌ No |
| **Multi-User** | ❌ No | ✅ Yes | ✅ Yes |
| **Data Persistence** | ⚠️ Device only | ⚠️ Server restart | ✅ Permanent |
| **Scalability** | ❌ Limited | ❌ Limited | ✅ High |
| **Performance** | ✅ Fast | ⚠️ Medium | ✅ Fast |
| **Production Ready** | ❌ No | ❌ No | ✅ Yes |
| **Backup Options** | Manual | Manual | Automatic |

## API Changes

### New Database Service
```typescript
import { databaseService } from '@/lib/database-service';

// Get all data
const data = await databaseService.getAllData();

// Add drink
const drink = await databaseService.addDrink(drinkData);

// Import data
const result = await databaseService.importData(data);
```

### Updated Context
The `AppContext` now automatically switches between services based on storage mode:
- `storageMode === 'local'` → Uses localStorage
- `storageMode === 'server'` → Uses file-based API
- `storageMode === 'database'` → Uses Prisma service

## Database Schema Highlights

### Raw Materials
```prisma
model RawMaterial {
  id                  String   @id @default(cuid())
  name                String
  unit                String
  totalQuantity       Float
  totalCost           Float
  costPerUnit         Float
  category            String   @default("main")
  sellingPrice        Float?
  purchaseSource      Json?
  lowStockThreshold   Float?
  // ... timestamps
}
```

### Products (Drinks/Foods)
```prisma
model Drink {
  id                String   @id @default(cuid())
  name              String
  costPrice         Float
  sellingPrice      Float
  ingredients       Json     // Recipe data
  availableToppings Json?    // Available toppings
  packagingOptions  Json?    // Packaging options
  // ... timestamps
}
```

### Sales
```prisma
model Sale {
  id                    String   @id @default(cuid())
  productId             String
  productType           String
  quantity              Int
  discount              Float
  date                  DateTime @default(now())
  totalSalePrice        Float
  selectedToppings      Json?
  selectedPackagingId   String?
  // ... timestamps and indexes
}
```

## Performance Optimizations

### Connection Pooling
Prisma automatically manages connection pooling for optimal performance.

### Query Optimization
- Added indexes on frequently queried fields (date, productId)
- Efficient JSON storage for complex data structures
- Batch operations for bulk imports

### Caching Strategy
- App-level caching via React state
- Database-level caching via Prisma
- Automatic query result caching

## Deployment Considerations

### Environment Variables
Ensure `DATABASE_URL` is set in your production environment:
- **Vercel**: Project Settings → Environment Variables
- **Railway**: Variables tab in project settings
- **Docker**: Pass as environment variable

### Database Backups
Set up automated backups:
- **Local**: Cron job with pg_dump
- **Railway**: Automatic backups included
- **Supabase**: Point-in-time recovery available

### Monitoring
Prisma provides query logging in development:
```typescript
log: process.env.NODE_ENV === 'development' 
  ? ['query', 'error', 'warn'] 
  : ['error']
```

## Troubleshooting

### Connection Issues
```bash
# Check PostgreSQL is running
pg_ctl status  # Windows
brew services list | grep postgresql  # Mac

# Test connection
psql -U postgres -d petrichor_db
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npm run prisma:push --force-reset
```

### Performance Issues
- Add indexes to slow queries
- Use connection pooling in production
- Consider read replicas for high traffic

## Benefits

### Production Ready
- ✅ Robust relational database
- ✅ ACID compliance for data integrity
- ✅ Scalable architecture
- ✅ Professional ORM with type safety

### Developer Experience
- ✅ Type-safe database queries
- ✅ Auto-completion in IDE
- ✅ Visual database editor (Prisma Studio)
- ✅ Easy migrations and schema management

### Data Management
- ✅ Automatic backup options
- ✅ Easy data export/import
- ✅ Relationship management
- ✅ Complex query support

## Next Steps

1. **Set up PostgreSQL** (local or cloud)
2. **Configure `.env` file** with DATABASE_URL
3. **Run database setup** (`npm run prisma:push`)
4. **Test with Prisma Studio** (`npm run prisma:studio`)
5. **Switch to database mode** in settings
6. **Enjoy production-ready backend!**

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Setup Guide](./DATABASE_SETUP.md)

---

**Your Petrichor application now has a professional, production-ready backend!** 🚀
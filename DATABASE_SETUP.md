# Database Setup Guide

## PostgreSQL + Prisma Integration

This guide will help you set up PostgreSQL database with Prisma ORM for your Petrichor application.

## Prerequisites

1. **PostgreSQL installed** on your system or use a cloud provider
2. **Node.js** (already installed if you're running the app)
3. **Basic knowledge** of database concepts

## Quick Setup Options

### Option 1: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL:**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE petrichor_db;
   
   # Create user (optional, for better security)
   CREATE USER petrichor_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE petrichor_db TO petrichor_user;
   ```

3. **Set Environment Variable:**
   Create a `.env` file in your project root:
   ```
   DATABASE_URL="postgresql://petrichor_user:your_password@localhost:5432/petrichor_db"
   ```

### Option 2: Cloud PostgreSQL (Easiest)

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → PostgreSQL
3. Copy the DATABASE_URL from your project variables
4. Add to your `.env` file

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy the URI and add to `.env` file

#### Neon
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string from dashboard
4. Add to `.env` file

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@prisma/client` - Prisma client for database queries
- `prisma` - Prisma CLI for database management
- `pg` - PostgreSQL driver

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Push Schema to Database
```bash
npm run prisma:push
```

This creates all tables in your database based on the Prisma schema.

### 4. (Optional) Create Migration
For production, use migrations instead of push:
```bash
npm run prisma:migrate
```

## Environment Configuration

Create a `.env` file in your project root:

```env
# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Examples:
# Local: DATABASE_URL="postgresql://postgres:password@localhost:5432/petrichor_db"
# Railway: DATABASE_URL="postgresql://postgres:xxx@containers.us-east-1.railway.app:5432/railway"
# Supabase: DATABASE_URL="postgresql://postgres.xxx@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:9002"

# Application Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:9002"
```

### Authentication Setup

The application includes a complete authentication system with NextAuth.js. After setting up the database:

1. **Generate Prisma Client** (if not done already):
   ```bash
   npm run prisma:generate
   ```

2. **Seed Authentication Data**:
   ```bash
   npm run seed:auth
   ```
   
   This creates:
   - Default roles (admin, manager, cashier, staff)
   - Default admin user (email: admin@petrichor.com, password: admin123)
   - Permission system

3. **Test Authentication**:
   - Navigate to `/auth/login`
   - Login with default admin credentials
   - Change the default password immediately

4. **Configure Session Security**:
   - Update `NEXTAUTH_SECRET` with a strong random key
   - Use `openssl rand -base64 32` to generate a secure secret

## Database Schema Overview

The Prisma schema includes the following models:

- **AppSettings** - Application configuration (name, logo, theme)
- **RawMaterial** - Inventory items with cost tracking
- **Drink** - Beverage products with recipes
- **Food** - Food products with recipes
- **Sale** - Transaction records
- **OperationalCost** - Business expenses
- **QueuedOrder** - POS order management

## Using Prisma Studio

Prisma Studio is a visual database editor:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View and edit data
- Create new records
- Run queries
- Explore relationships

## Database Operations

### Running Queries

You can use Prisma Client in your code:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Get all drinks
const drinks = await prisma.drink.findMany()

// Example: Create new drink
const newDrink = await prisma.drink.create({
  data: {
    name: 'Cappuccino',
    costPrice: 2.50,
    sellingPrice: 4.50,
    ingredients: []
  }
})
```

### Reset Database

To clear all data and reset schema:

```bash
npm run prisma:push --force-reset
```

⚠️ **Warning:** This will delete all data!

## Switching Storage Modes

The app now supports three storage modes:

1. **Local Storage** - Browser localStorage (default, no database needed)
2. **File Database** - Original db.json file (for demo/testing)
3. **PostgreSQL** - Full database integration (production-ready)

You can switch between modes in the app settings.

## Troubleshooting

### Connection Issues

If you get "Can't reach database server":

1. Check PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Mac/Linux
   brew services list | grep postgresql
   ```

2. Verify your DATABASE_URL is correct
3. Check firewall settings
4. Ensure database user has proper permissions

### Migration Issues

If migrations fail:

1. Reset database:
   ```bash
   npm run prisma:push --force-reset
   ```

2. Check Prisma schema for errors
3. Ensure PostgreSQL version is compatible (12+)

### Performance Issues

For better performance:

1. Add indexes to frequently queried fields
2. Use connection pooling in production
3. Consider read replicas for high traffic

## Production Deployment

### Vercel

1. Add DATABASE_URL to Vercel environment variables
2. Deploy: `vercel deploy`
3. Run migrations automatically with build

### Docker

```dockerfile
# Add to your Dockerfile
RUN npx prisma generate
COPY prisma ./prisma
```

### Environment Variables in Production

Never commit `.env` file. Use your hosting platform's environment variable settings:

- **Vercel**: Project Settings → Environment Variables
- **Railway**: Variables tab
- **Supabase**: Edge Functions settings

## Backup and Restore

### Backup
```bash
pg_dump -U postgres petrichor_db > backup.sql
```

### Restore
```bash
psql -U postgres petrichor_db < backup.sql
```

## Setup Verification Checklist

Before running the application, verify these items:

### Database Setup
- [ ] PostgreSQL is installed and running
- [ ] Database `petrichor_db` is created
- [ ] `.env` file exists with `DATABASE_URL` configured
- [ ] Database connection can be established

### Dependencies
- [ ] `npm install` has been run successfully
- [ ] All dependencies in `package.json` are installed
- [ ] No dependency conflicts detected

### Prisma Configuration
- [ ] `prisma/schema.prisma` is configured correctly
- [ ] `npm run prisma:generate` has been run successfully
- [ ] `npm run prisma:push` has created all tables
- [ ] Prisma Client is generated and available

### Authentication Setup
- [ ] `NEXTAUTH_SECRET` is set in `.env` (not the default)
- [ ] `NEXTAUTH_URL` is configured correctly
- [ ] `npm run seed:auth` has been run successfully
- [ ] Default admin user can login
- [ ] Default password has been changed

### Application Configuration
- [ ] `NODE_ENV` is set appropriately
- [ ] `NEXT_PUBLIC_APP_URL` matches your development server
- [ ] Environment variables are loaded correctly

### Code Integration
- [ ] All imports resolve correctly
- [ ] TypeScript types are compatible
- [ ] No broken references or missing files
- [ ] Backward compatibility is maintained

### Testing
- [ ] Application starts without errors
- [ ] Database operations work correctly
- [ ] Authentication flow works
- [ ] Storage mode switching works
- [ ] API routes respond correctly

## Next Steps

1. Set up your PostgreSQL database
2. Configure `.env` file with all required variables
3. Run `npm run prisma:generate` to generate Prisma Client
4. Run `npm run prisma:push` to create tables
5. Run `npm run seed:auth` to set up authentication
6. Test with `npm run prisma:studio`
7. Start the application with `npm run dev`
8. Verify all items in the Setup Verification Checklist above

## Support

For issues with:
- **Prisma**: [Prisma Documentation](https://www.prisma.io/docs)
- **PostgreSQL**: [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- **This integration**: Check the code in `src/lib/prisma.ts`
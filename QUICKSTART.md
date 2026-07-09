# Quick Start Guide - Petrichor Beverage Management System

Get up and running in 5 minutes with this quick start guide.

## Prerequisites

- Node.js installed (v18+)
- PostgreSQL installed OR cloud PostgreSQL account
- Git installed

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
cd petrichor-beverage-master
npm install
```

### 2. Set Up Database (2 min)

**Option A: Local PostgreSQL**
```bash
# Create database
psql -U postgres
CREATE DATABASE petrichor_db;
\q
```

**Option B: Cloud PostgreSQL (Railway)**
1. Go to [railway.app](https://railway.app)
2. Create new project → PostgreSQL
3. Copy DATABASE_URL

### 3. Configure Environment (1 min)

Create `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/petrichor_db"
NEXTAUTH_SECRET="change-this-to-a-random-string"
NEXTAUTH_URL="http://localhost:9002"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:9002"
```

### 4. Initialize Database (1 min)

```bash
npm run prisma:generate
npm run prisma:push
npm run seed:auth
```

### 5. Start Application (30 sec)

```bash
npm run dev
```

Navigate to `http://localhost:9002`

## First Login

1. Go to `http://localhost:9002/auth/login`
2. Login with:
   - Email: `admin@petrichor.com`
   - Password: `admin123`
3. **Change password immediately!**

## Basic Configuration

1. **Appearance**: Navigate to `/pengaturan/tampilan`
   - Set app name
   - Upload logo
   - Choose theme

2. **Storage**: Navigate to `/pengaturan/storage`
   - Choose storage mode (Local/File/Database)
   - Import existing data if needed

3. **Products**: Add your drinks and foods
4. **Inventory**: Set up raw materials
5. **POS**: Start taking orders

## Common Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run prisma:studio    # Open database viewer
npm run seed:auth        # Reset authentication data
```

## Need Help?

- For detailed setup: See `DEPLOYMENT_GUIDE.md`
- For database details: See `DATABASE_SETUP.md`
- For authentication: See `AUTHENTICATION_GUIDE.md`
- For architecture: See `SYSTEM_FLOW.md`

## Next Steps

1. Change default admin password
2. Create user accounts for staff
3. Add your products and inventory
4. Configure your theme and branding
5. Start using the POS system

---

**That's it! You're ready to use Petrichor.** 🚀

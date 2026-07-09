# Complete Deployment Guide - Petrichor Beverage Management System

This guide will take you from initial setup to production deployment of the Petrichor application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Application Configuration](#application-configuration)
6. [Testing & Verification](#testing--verification)
7. [Deployment Options](#deployment-options)
8. [Post-Deployment Steps](#post-deployment-steps)
9. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher) OR cloud PostgreSQL provider
- **Git** (for version control)
- **npm** or **yarn** (package manager)

### Required Accounts (for cloud deployment)
- **Vercel** account (recommended) OR
- **Railway** account OR
- **AWS/DigitalOcean/Heroku** account

### Optional but Recommended
- **Domain name** (for custom URL)
- **SSL certificate** (for HTTPS)
- **Monitoring service** (Sentry, LogRocket, etc.)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd petrichor-beverage-master
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 15
- Prisma ORM
- NextAuth.js
- PostgreSQL client
- UI components (Radix UI)
- Other utilities

### 3. Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Test TypeScript compilation
npm run typecheck
```

---

## Database Configuration

### Option A: Local PostgreSQL (Development)

#### Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer and follow prompts
# Set password for postgres user
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql shell:
CREATE DATABASE petrichor_db;
CREATE USER petrichor_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE petrichor_db TO petrichor_user;
\q
```

### Option B: Cloud PostgreSQL (Production)

#### Railway (Easiest)
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy DATABASE_URL from project variables
4. Database is ready to use

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy the connection string

#### Neon
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

### Configure Database Connection

Create `.env` file in project root:

```env
# Database Configuration
DATABASE_URL="postgresql://petrichor_user:your_secure_password@localhost:5432/petrichor_db"

# For cloud providers, use their provided connection string:
# Railway: DATABASE_URL="postgresql://postgres:xxx@containers.us-east-1.railway.app:5432/railway"
# Supabase: DATABASE_URL="postgresql://postgres.xxx@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
# Neon: DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) View database in Prisma Studio
npm run prisma:studio
```

---

## Authentication Setup

### 1. Generate NextAuth Secret

```bash
# Generate a secure secret
openssl rand -base64 32
```

### 2. Configure Environment Variables

Add to `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:9002"  # Change to production URL later

# Application Configuration
NODE_ENV="development"  # Change to "production" for deployment
NEXT_PUBLIC_APP_URL="http://localhost:9002"  # Change to production URL later
```

### 3. Seed Authentication Data

```bash
npm run seed:auth
```

This creates:
- **Roles**: admin, manager, cashier, staff
- **Default Admin User**:
  - Email: `admin@petrichor.com`
  - Password: `admin123`
  - **⚠️ Change this password immediately after first login!**
- **Permissions System**: Full RBAC implementation

### 4. Test Authentication

```bash
# Start development server
npm run dev

# Navigate to http://localhost:9002/auth/login
# Login with admin@petrichor.com / admin123
# Change password immediately
```

---

## Application Configuration

### 1. Configure Application Settings

The application has configurable settings accessible via the UI or database:

#### Default Settings (created automatically)
- **App Name**: Petrichor
- **Theme**: Default theme
- **Storage Mode**: Local Storage (changeable in settings)

#### Custom Settings (via UI)
1. Navigate to `/pengaturan/tampilan` (Appearance Settings)
2. Configure:
   - App name
   - Logo image
   - Marquee text
   - Theme selection

3. Navigate to `/pengaturan/storage` (Storage Settings)
4. Configure:
   - Storage mode (Local/File/Database)
   - Import/Export data

### 2. Configure CORS (if needed)

If your API needs to be accessed from other domains, add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

---

## Testing & Verification

### 1. Run Type Checking

```bash
npm run typecheck
```

### 2. Run Linting

```bash
npm run lint
```

### 3. Test Development Build

```bash
# Build the application
npm run build

# Start production server locally
npm start

# Navigate to http://localhost:9002
# Test all features
```

### 4. Feature Testing Checklist

#### Authentication
- [ ] Login works with default admin credentials
- [ ] Password change works
- [ ] Logout works
- [ ] Session persists correctly
- [ ] Protected routes redirect to login

#### Database Operations
- [ ] Create product (drink/food)
- [ ] Update product
- [ ] Delete product
- [ ] Create sale
- [ ] View sales history
- [ ] Add operational cost
- [ ] Import/Export data

#### UI/UX
- [ ] Theme switching works
- [ ] All pages load correctly
- [ ] Responsive design works on mobile
- [ ] POS interface functions correctly
- [ ] Analytics display correctly

#### Storage Modes
- [ ] Local Storage mode works
- [ ] File storage mode works
- [ ] Database storage mode works
- [ ] Switching between modes preserves data

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Prerequisites
- Vercel account
- Connected GitHub repository

#### Steps

1. **Prepare for Deployment**
```bash
# Update .env for production
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Deploy**
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to configure project
```

4. **Configure Environment Variables in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `DATABASE_URL` (your cloud PostgreSQL connection string)
     - `NEXTAUTH_SECRET` (your generated secret)
     - `NEXTAUTH_URL` (your Vercel URL)
     - `NODE_ENV` = `production`

5. **Set Up Database Migration**
   - Vercel will automatically run `postinstall` script
   - This generates Prisma Client
   - You may need to manually run `prisma db push` on first deployment

6. **Custom Domain (Optional)**
   - In Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Configure DNS records

#### Pros
- Zero configuration
- Automatic HTTPS
- Fast CDN
- Free tier available
- Easy preview deployments

#### Cons
- Limited build time on free tier
- Database must be external

### Option 2: Railway

#### Prerequisites
- Railway account
- Connected GitHub repository

#### Steps

1. **Create New Project**
   - Go to Railway Dashboard
   - Click "New Project"
   - "Deploy from GitHub repo"

2. **Configure Project**
   - Select your repository
   - Railway will detect Next.js automatically
   - Configure build settings:
     - Build Command: `npm run build`
     - Start Command: `npm start`

3. **Add PostgreSQL**
   - In project view, click "New Service"
   - Select "PostgreSQL"
   - Railway will provide DATABASE_URL

4. **Set Environment Variables**
   - In project settings, add:
     - `NEXTAUTH_SECRET` (generate one)
     - `NEXTAUTH_URL` (Railway will provide URL)
     - `NODE_ENV` = `production`

5. **Deploy**
   - Railway will automatically deploy
   - Database migrations need to be set up

#### Pros
- All-in-one (app + database)
- Simple setup
- Good free tier
- Automatic SSL

#### Cons
- Less flexible than Vercel
- Limited scaling options

### Option 3: Self-Hosted (VPS/Dedicated Server)

#### Prerequisites
- VPS or dedicated server (Ubuntu recommended)
- Domain name
- Basic Linux knowledge

#### Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

2. **Deploy Application**
```bash
# Clone repository
git clone <your-repo-url>
cd petrichor-beverage-master

# Install dependencies
npm install --production

# Build application
npm run build

# Generate Prisma Client
npm run prisma:generate

# Push database schema
npm run prisma:push

# Seed authentication
npm run seed:auth
```

3. **Configure Environment**
```bash
# Create .env file
nano .env

# Add production values
DATABASE_URL="postgresql://user:password@localhost:5432/petrichor_db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

4. **Start with PM2**
```bash
# Start application
pm2 start npm --name "petrichor" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

5. **Configure Nginx**
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/petrichor

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/petrichor /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

6. **Setup SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will auto-renew certificates
```

#### Pros
- Full control
- Cost-effective at scale
- Custom configuration
- No platform lock-in

#### Cons
- Requires maintenance
- Security responsibility
- More complex setup

---

## Post-Deployment Steps

### 1. Final Configuration

#### Update Production URLs
```env
# In your deployment platform's environment variables:
NEXTAUTH_URL="https://your-production-domain.com"
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
```

#### Update App Settings
- Log in as admin
- Navigate to `/pengaturan/tampilan`
- Update app name, logo, and other settings
- Select production theme

#### Create Production Users
- Navigate to user management (if implemented)
- Create user accounts for staff
- Assign appropriate roles
- Disable or delete default admin account (optional)

### 2. Security Hardening

#### Authentication
- [ ] Change default admin password
- [ ] Enable 2FA (if implemented)
- [ ] Set strong password policies
- [ ] Regularly rotate NEXTAUTH_SECRET

#### Database
- [ ] Use strong database password
- [ ] Enable SSL for database connections
- [ ] Regular backups
- [ ] Restrict database access

#### Application
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Use HTTPS only
- [ ] Implement CSP headers

### 3. Backup Strategy

#### Database Backups
```bash
# Manual backup
pg_dump -U postgres petrichor_db > backup_$(date +%Y%m%d).sql

# Automated backup (cron job)
0 2 * * * pg_dump -U postgres petrichor_db > /backups/petrichor_$(date +\%Y\%m\%d).sql
```

#### Application Backups
- Regular commits to Git
- Backup configuration files
- Export data regularly via app UI

### 4. Monitoring Setup

#### Application Monitoring
- Add error tracking (Sentry, LogRocket)
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor performance (Vercel Analytics, Google Analytics)

#### Database Monitoring
- Monitor connection pool
- Track query performance
- Set up alerts for database issues

---

## Maintenance & Monitoring

### Regular Tasks

#### Daily
- Check application uptime
- Review error logs
- Monitor database performance

#### Weekly
- Review user activity
- Check for security updates
- Verify backup integrity

#### Monthly
- Update dependencies
- Review and optimize database
- Audit user accounts
- Test disaster recovery

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update Next.js
npm install next@latest

# Regenerate Prisma Client after updates
npm run prisma:generate
```

### Scaling Considerations

#### When to Scale
- High traffic (>1000 concurrent users)
- Slow database queries
- Memory/CPU constraints

#### Scaling Options
- **Vertical**: Upgrade server resources
- **Horizontal**: Add more servers
- **Database**: Read replicas, connection pooling
- **CDN**: Static asset delivery

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check DATABASE_URL format
# Verify database is running
# Check firewall settings
# Test connection: psql $DATABASE_URL
```

#### Authentication Not Working
```bash
# Verify NEXTAUTH_SECRET is set
# Check NEXTAUTH_URL matches domain
# Clear browser cookies
# Check session configuration
```

#### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### Deployment Failures
```bash
# Check build logs
# Verify environment variables
# Test build locally first
# Check Node.js version compatibility
```

---

## Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Prisma Discord](https://discord.gg/prisma)
- [Stack Overflow](https://stackoverflow.com)

### Project-Specific
- Review `DATABASE_SETUP.md` for database details
- Review `AUTHENTICATION_GUIDE.md` for auth details
- Review `SYSTEM_FLOW.md` for architecture details

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
npm run typecheck        # Type check

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:migrate   # Create and run migration
npm run prisma:studio    # Open Prisma Studio
npm run seed:auth        # Seed authentication data

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
```

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://..."

# Optional
# Add custom variables as needed
```

### Default Credentials

```
Admin User:
Email: admin@petrichor.com
Password: admin123 (CHANGE IMMEDIATELY!)
```

---

## Success Criteria

Your deployment is successful when:

- [ ] Application loads at production URL
- [ ] HTTPS is enabled
- [ ] Authentication works correctly
- [ ] Database operations function properly
- [ ] All features work as expected
- [ ] Performance is acceptable
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Security best practices are followed

---

**Congratulations!** Your Petrichor Beverage Management System is now ready for production use. 🎉

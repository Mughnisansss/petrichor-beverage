# Setup & Deployment Checklist

Use this checklist to ensure your Petrichor application is properly configured and deployed.

## Phase 1: Initial Setup

### Prerequisites
- [ ] Node.js v18+ installed
- [ ] PostgreSQL installed OR cloud PostgreSQL account
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Project Setup
- [ ] Cloned repository
- [ ] Navigated to project directory
- [ ] Run `npm install`
- [ ] Verified Node.js version: `node --version`
- [ ] Verified npm version: `npm --version`

## Phase 2: Database Setup

### Local PostgreSQL
- [ ] PostgreSQL installed and running
- [ ] Database `petrichor_db` created
- [ ] User created with appropriate permissions
- [ ] Connection tested with `psql`

### Cloud PostgreSQL (if applicable)
- [ ] Account created (Railway/Supabase/Neon)
- [ ] Database instance created
- [ ] Connection string copied
- [ ] Connection tested

### Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `DATABASE_URL` configured correctly
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `NEXTAUTH_URL` configured
- [ ] `NODE_ENV` set appropriately
- [ ] `NEXT_PUBLIC_APP_URL` configured

## Phase 3: Database Initialization

### Prisma Setup
- [ ] Run `npm run prisma:generate`
- [ ] Run `npm run prisma:push`
- [ ] Verified tables created in database
- [ ] (Optional) Opened Prisma Studio: `npm run prisma:studio`

### Authentication Setup
- [ ] Run `npm run seed:auth`
- [ ] Verified roles created (admin, manager, cashier, staff)
- [ ] Verified default admin user created
- [ ] Tested login with default credentials

## Phase 4: Application Testing

### Development Server
- [ ] Run `npm run dev`
- [ ] Navigated to `http://localhost:9002`
- [ ] Application loads without errors
- [ ] No console errors in browser

### Authentication Testing
- [ ] Login page accessible
- [ ] Login with admin credentials works
- [ ] Password change works
- [ ] Logout works
- [ ] Session persists correctly
- [ ] Protected routes redirect to login

### Feature Testing
- [ ] Can create products (drinks/foods)
- [ ] Can update products
- [ ] Can delete products
- [ ] Can create sales
- [ ] Can view sales history
- [ ] Can add operational costs
- [ ] Can view analytics
- [ ] Can import/export data
- [ ] Theme switching works
- [ ] Settings pages work

### Storage Mode Testing
- [ ] Local storage mode works
- [ ] File storage mode works
- [ ] Database storage mode works
- [ ] Can switch between modes
- [ ] Data preserved during mode switch

## Phase 5: Pre-Deployment

### Code Quality
- [ ] Run `npm run typecheck` (no errors)
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (successful)
- [ ] Build tested locally: `npm start`

### Security
- [ ] Changed default admin password
- [ ] Changed default user passwords
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database password is strong
- [ ] Removed any test data
- [ ] Reviewed code for sensitive data

### Configuration
- [ ] Production URLs configured
- [ ] Environment variables for production set
- [ ] CORS configured (if needed)
- [ ] Analytics configured (optional)
- [ ] Error tracking configured (optional)

## Phase 6: Deployment

### Platform-Specific Setup

#### Vercel
- [ ] Vercel account created
- [ ] Project connected to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Custom domain configured (optional)
- [ ] Deployed successfully

#### Railway
- [ ] Railway account created
- [ ] Project connected to GitHub
- [ ] PostgreSQL service added
- [ ] Environment variables configured
- [ ] Deployed successfully

#### Self-Hosted
- [ ] Server provisioned
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Nginx/Apache configured
- [ ] PM2 set up
- [ ] Application deployed
- [ ] Reverse proxy configured

### Post-Deployment
- [ ] Application accessible at production URL
- [ ] HTTPS enabled
- [ ] Authentication works in production
- [ ] Database operations work
- [ ] All features functional
- [ ] Performance acceptable

## Phase 7: Production Configuration

### Application Settings
- [ ] Production app name set
- [ ] Logo uploaded
- [ ] Theme selected
- [ ] Marquee text configured
- [ ] Storage mode set to Database

### User Management
- [ ] Default admin password changed
- [ ] Production users created
- [ ] Roles assigned correctly
- [ ] Default accounts disabled (optional)

### Backup & Monitoring
- [ ] Database backup configured
- [ ] Automated backup schedule set
- [ ] Backup restoration tested
- [ ] Uptime monitoring configured
- [ ] Error tracking configured
- [ ] Performance monitoring set up

## Phase 8: Maintenance Setup

### Regular Tasks
- [ ] Dependency update schedule defined
- [ ] Security audit schedule defined
- [ ] Backup verification schedule defined
- [ ] Performance review schedule defined

### Documentation
- [ ] Deployment documented
- [ ] Custom configurations documented
- [ ] Emergency procedures documented
- [ ] Support contacts documented

## Phase 9: Final Verification

### End-to-End Testing
- [ ] Complete user flow tested
- [ ] POS operations tested
- [ ] Reports generated correctly
- [ ] Data export/import tested
- [ ] Multi-user scenarios tested

### Performance
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Handles expected concurrent users

### Security
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Input validation working
- [ ] SQL injection protection verified

---

## Quick Reference Commands

```bash
# Setup
npm install
npm run prisma:generate
npm run prisma:push
npm run seed:auth

# Development
npm run dev
npm run build
npm start

# Database
npm run prisma:studio
npm run prisma:migrate

# Quality
npm run typecheck
npm run lint
```

## Critical Security Reminders

⚠️ **MUST DO:**
- Change all default passwords immediately
- Use strong, unique NEXTAUTH_SECRET
- Enable HTTPS in production
- Regularly update dependencies
- Keep database credentials secure
- Never commit .env file

⚠️ **NEVER DO:**
- Use default passwords in production
- Commit sensitive data to Git
- Disable authentication in production
- Ignore security updates
- Share credentials in plain text

---

## Support Contacts

- **Documentation**: Check MD files in project root
- **Issues**: GitHub Issues (if available)
- **Emergency**: [Your support contact]

---

**Checklist Status**: [ ] Complete

**Date**: _______________

**Deployed By**: _______________

**Environment**: _______________

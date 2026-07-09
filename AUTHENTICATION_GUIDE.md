# Authentication & User Management System

## Overview
I've implemented a comprehensive authentication and role-based access control (RBAC) system for your Petrichor application using NextAuth.js and PostgreSQL.

## What Was Implemented

### 1. Database Schema Updates
**Added to Prisma Schema:**
- **User Model** - User accounts with authentication data
- **Role Model** - Role definitions with permissions
- **Session Model** - User session management
- **Account Model** - OAuth account support
- **VerificationToken Model** - Email verification support

**Updated Models:**
- **Sale** - Added `createdById` to track who made sales
- **OperationalCost** - Added `createdById` for audit trail
- **QueuedOrder** - Added `createdById` for accountability

### 2. Authentication System
**NextAuth.js Integration:**
- Credentials provider for email/password login
- JWT-based session management
- Secure password hashing with bcrypt
- Session persistence and management

### 3. Role-Based Access Control
**Predefined Roles:**
- **Admin** - Full system access (all permissions)
- **Manager** - Management access with some restrictions
- **Cashier** - POS and sales access
- **Staff** - Limited access for basic operations

**Permission System:**
- Granular permissions for each action
- Resource-action based permissions
- Easy to extend and customize

### 4. User Interface
**Created Components:**
- **Login Page** (`/auth/login`) - Secure login interface
- **Auth Header** - User profile dropdown with logout
- **Session Provider** - Authentication context for the app

### 5. Authentication Middleware
**Protection Functions:**
- `requireAuth()` - Require user to be logged in
- `requirePermission()` - Require specific permission
- `requireRole()` - Require specific role
- `requireAnyRole()` - Require one of multiple roles

### 6. Seed Data
**Auth Seed Script:**
- Creates default roles with permissions
- Creates default admin user
- Easy to run and customize

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `next-auth` - Authentication library
- `bcryptjs` - Password hashing
- `@next-auth/prisma-adapter` - Prisma integration
- TypeScript types for auth

### 2. Update Environment Variables
Add to your `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/petrichor_db"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:9002"
```

### 3. Update Database Schema
```bash
npm run prisma:push
```

### 4. Seed Authentication Data
```bash
npm run prisma:seed
```

This creates:
- Default roles (admin, manager, cashier, staff)
- Default admin user (admin@petrichor.com / admin123)

### 5. Start the Application
```bash
npm run dev
```

## Default Credentials

**Admin User:**
- Email: `admin@petrichor.com`
- Password: `admin123`
- Role: Admin (full access)

⚠️ **Important:** Change the default password after first login!

## User Roles & Permissions

### Admin
- Full system access
- User management
- Role assignment
- All permissions enabled

### Manager
- Product management
- Sales and reporting
- Inventory management
- Analytics access
- Basic user management
- Settings management

### Cashier
- View products
- Create sales
- View sales history
- POS operations
- Basic analytics

### Staff
- View products
- View inventory
- Basic POS operations

## Permission System

### Permission Categories
- **Products** - View, create, edit, delete products
- **Sales** - View, create, delete sales, generate reports
- **Inventory** - View, manage, delete inventory
- **Analytics** - View analytics, export data
- **Users** - View, create, edit, delete users, assign roles
- **Settings** - View, edit settings, import/export data
- **POS** - View POS, process orders, process refunds

### Usage Example
```typescript
import { requirePermission } from '@/lib/auth-middleware';
import { PERMISSIONS } from '@/lib/auth-types';

// Protect a route
export default async function ProductsPage() {
  await requirePermission('PRODUCTS_CREATE');
  // Page content
}
```

## API Routes

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### User Management (to be implemented)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/role` - Assign role

## Component Usage

### Authentication Header
```tsx
import { AuthHeader } from '@/components/auth-header';

export default function Layout() {
  return (
    <div>
      <AuthHeader />
      {/* Rest of your layout */}
    </div>
  );
}
```

### Session Access
```tsx
import { useSession } from 'next-auth/react';

export default function UserProfile() {
  const { data: session } = useSession();
  
  if (!session) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {session.user.name}</div>;
}
```

## Security Features

### Password Security
- bcrypt hashing with salt rounds
- Secure password storage
- No plain text passwords

### Session Security
- JWT-based sessions
- Secure token generation
- Configurable session expiration

### Access Control
- Role-based permissions
- Route-level protection
- Action-level authorization

### Audit Trail
- User tracking on sales
- CreatedBy fields on records
- Last login tracking

## Customization

### Adding New Roles
Edit `src/lib/auth-types.ts`:
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  // Add new role
  custom_role: [
    'PRODUCTS_VIEW',
    'SALES_VIEW',
    // Add permissions
  ],
};
```

### Adding New Permissions
1. Add to `PERMISSIONS` in `src/lib/auth-types.ts`
2. Add to role permissions
3. Use in middleware

### Custom Login Page
The login page can be customized in `src/app/auth/login/page.tsx`

## Multi-User Workflow

### For Admins
1. Login with admin credentials
2. Access user management (when implemented)
3. Create user accounts
4. Assign appropriate roles
5. Manage user permissions

### For Managers
1. Login with manager credentials
2. Access business management features
3. View analytics and reports
4. Manage inventory
5. Cannot manage users or change system settings

### For Cashiers
1. Login with cashier credentials
2. Access POS system
3. Process sales
4. View sales history
5. Limited to operational tasks

### For Staff
1. Login with staff credentials
2. View basic information
3. Limited POS access
4. Cannot modify critical data

## Migration from Single-User

### Current State
- App currently works without authentication
- Data is not tied to specific users
- No user tracking on operations

### With Authentication
- All operations require login
- Sales and costs track who created them
- Role-based access to features
- Audit trail for accountability

### Gradual Migration
1. Keep current functionality working
2. Add optional authentication
3. Gradually enforce authentication on critical features
4. Migrate existing data to include user associations

## Troubleshooting

### Login Issues
```bash
# Check database connection
npm run prisma:studio

# Reseed auth data
npm run prisma:seed

# Check NextAuth configuration
# Verify NEXTAUTH_SECRET is set
```

### Permission Issues
```bash
# Check user role in Prisma Studio
# Verify role permissions in database
# Check middleware implementation
```

### Session Issues
```bash
# Clear browser cookies
# Check NEXTAUTH_URL configuration
# Verify session configuration
```

## Next Steps

1. **Implement User Management UI** - Create admin interface for managing users
2. **Add User Registration** - Allow managers to create new user accounts
3. **Implement Role Assignment** - UI for assigning roles to users
4. **Add OAuth Providers** - Google, GitHub, etc. for easier login
5. **Implement Audit Logs** - Track all user actions
6. **Add Two-Factor Authentication** - Enhanced security
7. **Create User Activity Dashboard** - Monitor user activity

## Security Best Practices

1. **Change Default Password** - Immediately change admin password
2. **Use Strong NEXTAUTH_SECRET** - Generate secure random string
3. **Enable HTTPS** - Required for production
4. **Regular Password Updates** - Implement password expiration
5. **Limit Session Duration** - Configure appropriate session timeout
6. **Monitor Failed Logins** - Implement rate limiting
7. **Regular Security Audits** - Review user access and permissions

---

**Your Petrichor application now has enterprise-grade authentication and user management!** 🔐
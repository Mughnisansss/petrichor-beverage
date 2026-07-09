# Petrichor - Beverage Management System

A comprehensive Point of Sale (POS) and inventory management system for cafes and beverage businesses.

## Features

- **Point of Sale (POS)**: Intuitive interface for taking orders and processing payments
- **Inventory Management**: Track raw materials, costs, and stock levels
- **Recipe Costing**: Calculate product costs based on ingredient recipes
- **Analytics & Reporting**: Sales reports, profit analysis, and business insights
- **Multi-Storage Support**: Local storage, file-based, or PostgreSQL database
- **Authentication & Authorization**: Role-based access control (RBAC)
- **Custom Theming**: 10+ pre-built themes for different business types
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Context API
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod validation

## Documentation

### Quick Start
📖 **[QUICKSTART.md](QUICKSTART.md)** - Get up and running in 5 minutes

### Complete Setup
📖 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete guide from setup to production deployment

### Database Setup
📖 **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - PostgreSQL and Prisma configuration

### Authentication
📖 **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - User authentication and authorization

### System Architecture
📖 **[SYSTEM_FLOW.md](SYSTEM_FLOW.md)** - Application architecture and data flow

### Theme System
📖 **[THEME_SYSTEM.md](THEME_SYSTEM.md)** - Custom theming and branding

### Backend Integration
📖 **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - API and database service layer

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env)
cp .env.example .env

# Initialize database
npm run prisma:generate
npm run prisma:push
npm run seed:auth

# Start development server
npm run dev
```

Navigate to `http://localhost:9002`

**Default Admin Credentials:**
- Email: `admin@petrichor.com`
- Password: `admin123` (Change immediately!)

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/petrichor_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:9002"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:9002"
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server (port 9002)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:migrate   # Create database migration
npm run prisma:studio    # Open Prisma Studio (database viewer)
npm run seed:auth        # Seed authentication data
```

## Project Structure

```
petrichor-beverage-master/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── pengaturan/       # Settings pages
│   │   ├── pos/              # Point of Sale
│   │   └── ...               # Other pages
│   ├── components/           # React components
│   ├── context/             # React contexts
│   ├── lib/                 # Utilities and services
│   │   ├── auth-*.ts        # Authentication modules
│   │   ├── database-service.ts
│   │   ├── prisma.ts
│   │   └── types.ts
│   └── app/                 # Next.js 13+ app directory
├── public/                  # Static assets
├── .env.example            # Environment variables template
└── *.md                    # Documentation files
```

## Features Overview

### Point of Sale
- Product catalog with images
- Customizable toppings and packaging
- Discount support
- Queue management
- Receipt generation

### Inventory Management
- Raw material tracking
- Cost calculation (weighted average)
- Low stock alerts
- Purchase source tracking
- Category management (main, packaging, topping)

### Analytics
- Sales reports
- Profit analysis
- Revenue trends
- Best-selling products
- Operational cost tracking

### User Management
- Role-based access control
- User roles: Admin, Manager, Cashier, Staff
- Permission system
- Activity tracking

### Customization
- 10+ pre-built themes
- Custom app name and logo
- Marquee text configuration
- Responsive design

## Storage Modes

The application supports three storage modes:

1. **Local Storage** (Default)
   - Browser localStorage
   - No database required
   - Good for testing and single-user scenarios

2. **File Storage**
   - JSON file (db.json)
   - Persistent across sessions
   - Good for backup/restore

3. **Database Storage** (Recommended for Production)
   - PostgreSQL database
   - Multi-user support
   - Scalable and reliable
   - Full feature support

Switch between modes in Settings → Storage

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Configure environment variables in Vercel dashboard.

### Railway
```bash
# Connect to Railway
# Deploy from GitHub
# Railway auto-detects Next.js
```

### Self-Hosted
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed self-hosting instructions.

## Default Users

After running `npm run seed:auth`:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@petrichor.com | admin123 | Full access |
| Manager | manager@petrichor.com | manager123 | Management access |
| Cashier | cashier@petrichor.com | cashier123 | POS access |
| Staff | staff@petrichor.com | staff123 | Limited access |

**⚠️ Change all default passwords in production!**

## Security Considerations

- Change default passwords immediately
- Use strong NEXTAUTH_SECRET in production
- Enable HTTPS in production
- Regular database backups
- Keep dependencies updated
- Monitor application logs

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires v18+)

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the documentation files listed above
- Review troubleshooting sections
- Check GitHub issues
- Contact support (if available)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Integration with payment gateways
- [ ] Advanced reporting features
- [ ] API for third-party integrations

---

**Built with ❤️ for cafes and beverage businesses**

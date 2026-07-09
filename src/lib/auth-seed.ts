/**
 * Seed data for authentication
 * Creates default roles and initial admin user
 */

import prisma from './prisma';
import { ROLE_PERMISSIONS, type UserRole } from './auth-types';
import bcrypt from 'bcryptjs';

export async function seedAuthData() {
  console.log('🌱 Starting authentication seed...');

  try {
    // Create default roles
    const roles = [
      {
        name: 'admin' as UserRole,
        description: 'Full system access',
        permissions: ROLE_PERMISSIONS.admin.map(key => ({
          resource: key.split(':')[0],
          action: key.split(':')[1],
        })),
      },
      {
        name: 'manager' as UserRole,
        description: 'Management access with some restrictions',
        permissions: ROLE_PERMISSIONS.manager.map(key => ({
          resource: key.split(':')[0],
          action: key.split(':')[1],
        })),
      },
      {
        name: 'cashier' as UserRole,
        description: 'POS and sales access',
        permissions: ROLE_PERMISSIONS.cashier.map(key => ({
          resource: key.split(':')[0],
          action: key.split(':')[1],
        })),
      },
      {
        name: 'staff' as UserRole,
        description: 'Limited access for staff members',
        permissions: ROLE_PERMISSIONS.staff.map(key => ({
          resource: key.split(':')[0],
          action: key.split(':')[1],
        })),
      },
    ];

    for (const roleData of roles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: roleData,
        });
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`ℹ️  Role already exists: ${roleData.name}`);
      }
    }

    // Create default admin user
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (adminRole) {
      const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@petrichor.com' },
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const adminUser = await prisma.user.create({
          data: {
            name: 'Petrichor Admin',
            email: 'admin@petrichor.com',
            password: hashedPassword,
            roleId: adminRole.id,
            isActive: true,
          },
        });
        
        console.log(`✅ Created admin user: admin@petrichor.com (password: admin123)`);
        console.log(`⚠️  Please change the default password after first login!`);
      } else {
        console.log(`ℹ️  Admin user already exists: admin@petrichor.com`);
      }
    }

    console.log('🎉 Authentication seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedAuthData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
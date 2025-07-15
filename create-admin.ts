// Script to create SuperAdmin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: {
        email: 'admin@uacad.com'
      },
      update: {
        password: hashedPassword,
        role: 'SuperAdmin'
      },
      create: {
        id: 'superadmin-001',
        name: 'Super Administrator',
        email: 'admin@uacad.com',
        password: hashedPassword,
        role: 'SuperAdmin',
        emailVerified: new Date()
      }
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email: admin@uacad.com');
    console.log('🔒 Password: admin123');
    console.log('🔗 Login at: /admin/login');
    
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

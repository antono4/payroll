// ============================================
// NextAuth Configuration
// ============================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      employeeId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    employeeId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    employeeId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true, employee: true },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        // Log audit
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entityType: 'user',
            entityId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.employee?.fullName || user.email,
          role: user.role.name,
          employeeId: user.employeeId || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employeeId = user.employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.employeeId = token.employeeId;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Role-based access control helper
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['*'],
    hr_admin: [
      'employees:read', 'employees:create', 'employees:update', 'employees:delete',
      'payroll:read', 'payroll:process', 'payroll:approve',
      'attendance:read', 'attendance:create', 'attendance:update',
      'leave:read', 'leave:approve', 'leave:manage',
      'reports:read', 'reports:export',
      'components:read', 'components:manage',
    ],
    employee: [
      'profile:read', 'profile:update',
      'payslip:read', 'payslip:download',
      'leave:read', 'leave:create', 'leave:own',
      'attendance:read:own',
    ],
  };

  const permissions = rolePermissions[userRole] || [];
  
  if (permissions.includes('*')) return true;
  return permissions.includes(requiredPermission);
}

// Check if user can access resource
export function canAccess(userRole: string, resource: string, action: string): boolean {
  const permission = `${resource}:${action}`;
  return hasPermission(userRole, permission);
}

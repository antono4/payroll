// ============================================
// Database Seed - Initial Data
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // ============================================
  // Create Roles
  // ============================================
  console.log('Creating roles...');

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator with full access',
      permissions: ['*'],
    },
  });

  const hrAdminRole = await prisma.role.upsert({
    where: { name: 'hr_admin' },
    update: {},
    create: {
      name: 'hr_admin',
      description: 'HR Administrator for payroll management',
      permissions: JSON.stringify([
        'employees:read', 'employees:create', 'employees:update', 'employees:delete',
        'payroll:read', 'payroll:process', 'payroll:approve',
        'attendance:read', 'attendance:create', 'attendance:update',
        'leave:read', 'leave:approve', 'leave:manage',
        'reports:read', 'reports:export',
        'components:read', 'components:manage',
      ]),
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Regular employee with self-service access',
      permissions: JSON.stringify([
        'profile:read', 'profile:update',
        'payslip:read', 'payslip:download',
        'leave:read', 'leave:create', 'leave:own',
        'attendance:read:own',
      ]),
    },
  });

  // ============================================
  // Create Default Company
  // ============================================
  console.log('Creating default company...');

  const company = await prisma.company.upsert({
    where: { id: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      name: 'PT Contoh Indonesia',
      address: 'Jl. Contoh No. 123, Jakarta Selatan',
      phone: '+62 21 1234 5678',
      email: 'hr@contoh.co.id',
      taxId: '01.234.567.8-999.000',
    },
  });

  // ============================================
  // Create Departments
  // ============================================
  console.log('Creating departments...');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'IT' },
      update: {},
      create: {
        companyId: company.id,
        name: 'Information Technology',
        code: 'IT',
      },
    }),
    prisma.department.upsert({
      where: { code: 'HR' },
      update: {},
      create: {
        companyId: company.id,
        name: 'Human Resources',
        code: 'HR',
      },
    }),
    prisma.department.upsert({
      where: { code: 'FIN' },
      update: {},
      create: {
        companyId: company.id,
        name: 'Finance',
        code: 'FIN',
      },
    }),
    prisma.department.upsert({
      where: { code: 'MKT' },
      update: {},
      create: {
        companyId: company.id,
        name: 'Marketing',
        code: 'MKT',
      },
    }),
    prisma.department.upsert({
      where: { code: 'OPS' },
      update: {},
      create: {
        companyId: company.id,
        name: 'Operations',
        code: 'OPS',
      },
    }),
  ]);

  // ============================================
  // Create Positions
  // ============================================
  console.log('Creating positions...');

  const positions = await Promise.all([
    prisma.position.create({
      data: {
        departmentId: departments[0].id,
        title: 'Software Engineer',
        level: 2,
        grade: 'E2',
      },
    }),
    prisma.position.create({
      data: {
        departmentId: departments[0].id,
        title: 'IT Manager',
        level: 4,
        grade: 'M1',
      },
    }),
    prisma.position.create({
      data: {
        departmentId: departments[1].id,
        title: 'HR Manager',
        level: 4,
        grade: 'M1',
      },
    }),
    prisma.position.create({
      data: {
        departmentId: departments[2].id,
        title: 'Finance Manager',
        level: 4,
        grade: 'M1',
      },
    }),
  ]);

  // ============================================
  // Create Salary Components
  // ============================================
  console.log('Creating salary components...');

  // Earning Components
  const earningComponents = [
    { code: 'BASIC_SALARY', name: 'Gaji Pokok', category: 'fixed', priority: 1 },
    { code: 'TRANSPORT_ALLOWANCE', name: 'Tunjangan Transportasi', category: 'allowance', priority: 2 },
    { code: 'MEAL_ALLOWANCE', name: 'Tunjangan Makan', category: 'allowance', priority: 3 },
    { code: 'COMMUNICATION_ALLOWANCE', name: 'Tunjangan Komunikasi', category: 'allowance', priority: 4 },
    { code: 'HEALTH_ALLOWANCE', name: 'Tunjangan Kesehatan', category: 'allowance', priority: 5 },
    { code: 'POSITION_ALLOWANCE', name: 'Tunjangan Jabatan', category: 'allowance', priority: 6 },
    { code: 'ATTENDANCE_ALLOWANCE', name: 'Tunjangan Kehadiran', category: 'attendance', calculationType: 'attendance_based', priority: 7 },
    { code: 'OVERTIME_PAY', name: 'Uang Lembur', category: 'variable', calculationType: 'formula', priority: 8 },
    { code: 'BONUS', name: 'Bonus', category: 'variable', calculationType: 'percentage', priority: 9 },
    { code: 'THR', name: 'Tunjangan Hari Raya', category: 'benefit', calculationType: 'percentage', priority: 10 },
  ];

  for (const comp of earningComponents) {
    await prisma.salaryComponent.upsert({
      where: { code: comp.code },
      update: {},
      create: {
        code: comp.code,
        name: comp.name,
        type: 'earning',
        category: comp.category,
        calculationType: comp.calculationType || 'fixed',
        isTaxable: comp.code !== 'TRANSPORT_ALLOWANCE', // Transport allowance may be non-taxable
        isBpjsSubject: comp.code === 'BASIC_SALARY' || comp.code === 'POSITION_ALLOWANCE',
        priority: comp.priority,
      },
    });
  }

  // Deduction Components
  const deductionComponents = [
    { code: 'BPJS_KESEHATAN_EMPLOYEE', name: 'BPJS Kesehatan (Karyawan)', category: 'bpjs', priority: 1 },
    { code: 'BPJS_JHT_EMPLOYEE', name: 'BPJS JHT (Karyawan)', category: 'bpjs', priority: 2 },
    { code: 'BPJS_JP_EMPLOYEE', name: 'BPJS JP (Karyawan)', category: 'bpjs', priority: 3 },
    { code: 'LOAN_INSTALLMENT', name: 'Angsuran Pinjaman', category: 'loan', priority: 4 },
    { code: 'ABSENCE_DEDUCTION', name: 'Potongan Absensi', category: 'attendance', calculationType: 'attendance_based', priority: 5 },
    { code: 'LATE_PENALTY', name: 'Denda Keterlambatan', category: 'attendance', calculationType: 'attendance_based', priority: 6 },
  ];

  for (const comp of deductionComponents) {
    await prisma.salaryComponent.upsert({
      where: { code: comp.code },
      update: {},
      create: {
        code: comp.code,
        name: comp.name,
        type: 'deduction',
        category: comp.category,
        calculationType: comp.calculationType || 'fixed',
        isTaxable: false,
        isBpjsSubject: false,
        priority: comp.priority,
      },
    });
  }

  // Tax Components
  await prisma.salaryComponent.upsert({
    where: { code: 'PPH21' },
    update: {},
    create: {
      code: 'PPH21',
      name: 'PPh 21',
      type: 'tax',
      category: 'income_tax',
      calculationType: 'formula',
      isTaxable: false,
      isBpjsSubject: false,
      priority: 1,
    },
  });

  // ============================================
  // Create Leave Types
  // ============================================
  console.log('Creating leave types...');

  const leaveTypes = [
    { code: 'annual', name: 'Cuti Tahunan', defaultDays: 12, isPaid: true },
    { code: 'sick', name: 'Cuti Sakit', defaultDays: 14, isPaid: true },
    { code: 'maternity', name: 'Cuti Melahirkan', defaultDays: 90, isPaid: true },
    { code: 'paternity', name: 'Cuti Ayah', defaultDays: 3, isPaid: true },
    { code: 'bereavement', name: 'Cuti Duka Cita', defaultDays: 2, isPaid: true },
    { code: 'unpaid', name: 'Cuti Tidak Dibayar', defaultDays: 0, isPaid: false },
  ];

  for (const leave of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { code: leave.code },
      update: {},
      create: {
        code: leave.code,
        name: leave.name,
        defaultDays: leave.defaultDays,
        isPaid: leave.isPaid,
        requiresApproval: leave.code !== 'sick',
      },
    });
  }

  // ============================================
  // Create Work Schedule
  // ============================================
  console.log('Creating work schedules...');

  await prisma.workSchedule.upsert({
    where: { id: 'default-schedule' },
    update: {},
    create: {
      id: 'default-schedule',
      name: 'Regular 5 Days',
      type: 'regular',
      schedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: null,
        sunday: null,
      },
    },
  });

  // ============================================
  // Create Admin User
  // ============================================
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@contoh.co.id' },
    update: {},
    create: {
      email: 'admin@contoh.co.id',
      passwordHash: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  // Create admin employee
  const adminEmployee = await prisma.employee.upsert({
    where: { employeeNumber: 'EMP001' },
    update: {},
    create: {
      userId: adminUser.id,
      employeeNumber: 'EMP001',
      fullName: 'Administrator',
      email: 'admin@contoh.co.id',
      departmentId: departments[1].id,
      positionId: positions[2].id,
      employmentType: 'permanent',
      joinDate: new Date('2020-01-01'),
      status: 'active',
      ptkpStatus: 'k0',
    },
  });

  // Link user to employee
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { employeeId: adminEmployee.id },
  });

  // Create sample HR employee
  console.log('Creating sample employees...');

  const hrPassword = await bcrypt.hash('hr123', 12);
  const hrUser = await prisma.user.create({
    data: {
      email: 'hr@contoh.co.id',
      passwordHash: hrPassword,
      roleId: hrAdminRole.id,
      employee: {
        create: {
          employeeNumber: 'EMP002',
          fullName: 'Budi Santoso',
          gender: 'L',
          birthDate: new Date('1990-05-15'),
          nik: '3201234509900001',
          npwp: '01.234.567.8-999.001',
          email: 'budi@contoh.co.id',
          phone: '+6281234567890',
          departmentId: departments[1].id,
          positionId: positions[2].id,
          employmentType: 'permanent',
          joinDate: new Date('2021-03-15'),
          status: 'active',
          ptkpStatus: 'k1',
          bankName: 'Bank Central Asia',
          bankAccount: '1234567890',
          bankAccountName: 'Budi Santoso',
          bpjsKetenagakerjaNumber: '1234567890123',
          bpjsKesehatanNumber: '0001234567890',
        },
      },
    },
    include: { employee: true },
  });

  // ============================================
  // Create Sample Employee User
  // ============================================
  console.log('Creating sample employee users...');

  const empPassword = await bcrypt.hash('emp123', 12);
  const empUser = await prisma.user.create({
    data: {
      email: 'john.doe@contoh.co.id',
      passwordHash: empPassword,
      roleId: employeeRole.id,
      employee: {
        create: {
          employeeNumber: 'EMP003',
          fullName: 'John Doe',
          gender: 'L',
          birthDate: new Date('1995-08-20'),
          nik: '3201234509950001',
          npwp: '01.234.567.8-999.002',
          email: 'john.doe@contoh.co.id',
          phone: '+6281234567891',
          departmentId: departments[0].id,
          positionId: positions[0].id,
          employmentType: 'permanent',
          joinDate: new Date('2023-01-10'),
          status: 'active',
          ptkpStatus: 'tk0',
          bankName: 'Bank Mandiri',
          bankAccount: '1300098765432',
          bankAccountName: 'John Doe',
          bpjsKetenagakerjaNumber: '1234567890124',
          bpjsKesehatanNumber: '0001234567891',
          salaryStructures: {
            create: [
              { componentId: (await prisma.salaryComponent.findUnique({ where: { code: 'BASIC_SALARY' } }))!.id, amount: 10000000, effectiveDate: new Date('2023-01-01') },
              { componentId: (await prisma.salaryComponent.findUnique({ where: { code: 'TRANSPORT_ALLOWANCE' } }))!.id, amount: 1500000, effectiveDate: new Date('2023-01-01') },
              { componentId: (await prisma.salaryComponent.findUnique({ where: { code: 'MEAL_ALLOWANCE' } }))!.id, amount: 1000000, effectiveDate: new Date('2023-01-01') },
              { componentId: (await prisma.salaryComponent.findUnique({ where: { code: 'COMMUNICATION_ALLOWANCE' } }))!.id, amount: 500000, effectiveDate: new Date('2023-01-01') },
            ],
          },
        },
      },
    },
  });

  // Create leave balances for employee
  const annualLeaveType = await prisma.leaveType.findUnique({ where: { code: 'annual' } });
  if (annualLeaveType && empUser.employee) {
    await prisma.leaveBalance.create({
      data: {
        employeeId: empUser.employee.id,
        leaveTypeId: annualLeaveType.id,
        year: new Date().getFullYear(),
        totalDays: annualLeaveType.defaultDays,
        usedDays: 0,
        pendingDays: 0,
      },
    });
  }

  console.log('Database seed completed successfully!');
  console.log('\n=== Login Credentials ===');
  console.log('Super Admin: admin@contoh.co.id / admin123');
  console.log('HR Admin: hr@contoh.co.id / hr123');
  console.log('Employee: john.doe@contoh.co.id / emp123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

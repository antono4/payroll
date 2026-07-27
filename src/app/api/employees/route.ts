// ============================================
// Employees API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/employees - List all employees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status') || 'active';

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (departmentId) {
      where.departmentId = departmentId;
    }
    
    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: true,
          position: true,
          user: {
            select: {
              email: true,
              role: { select: { name: true } },
            },
          },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['fullName', 'employeeNumber', 'joinDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate employee number
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeNumber: body.employeeNumber },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee number already exists' },
        { status: 400 }
      );
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        fullName: body.fullName,
        employeeNumber: body.employeeNumber,
        nickname: body.nickname,
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        birthPlace: body.birthPlace,
        maritalStatus: body.maritalStatus,
        nik: body.nik,
        kkNumber: body.kkNumber,
        npwp: body.npwp,
        email: body.email,
        phone: body.phone,
        personalEmail: body.personalEmail,
        address: body.address,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelation: body.emergencyContactRelation,
        positionId: body.positionId,
        departmentId: body.departmentId,
        employmentType: body.employmentType || 'permanent',
        joinDate: new Date(body.joinDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || 'active',
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankAccountName: body.bankAccountName,
        bankBranch: body.bankBranch,
        ptkpStatus: body.ptkpStatus || 'tk0',
        bpjsKetenagakerjaNumber: body.bpjsKetenagakerjaNumber,
        bpjsKesehatanNumber: body.bpjsKesehatanNumber,
        bpjsKetenagakerjaClass: body.bpjsKetenagakerjaClass || 1,
        bpjsKesehatanClass: body.bpjsKesehatanClass || 1,
        photoUrl: body.photoUrl,
      },
      include: {
        department: true,
        position: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}

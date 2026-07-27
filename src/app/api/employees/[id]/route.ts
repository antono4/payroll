// ============================================
// Single Employee API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/employees/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        user: {
          select: {
            email: true,
            role: { select: { name: true } },
          },
        },
        dependents: true,
        salaryStructures: {
          where: { isActive: true },
          include: {
            component: true,
          },
          orderBy: { effectiveDate: 'desc' },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        leaveBalances: {
          include: {
            leaveType: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if employee exists
    const existing = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Update employee
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        fullName: body.fullName,
        nickname: body.nickname,
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
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
        employmentType: body.employmentType,
        joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        status: body.status,
        bankName: body.bankName,
        bankAccount: body.bankAccount,
        bankAccountName: body.bankAccountName,
        bankBranch: body.bankBranch,
        ptkpStatus: body.ptkpStatus,
        bpjsKetenagakerjaNumber: body.bpjsKetenagakerjaNumber,
        bpjsKesehatanNumber: body.bpjsKesehatanNumber,
        bpjsKetenagakerjaClass: body.bpjsKetenagakerjaClass,
        bpjsKesehatanClass: body.bpjsKesehatanClass,
        photoUrl: body.photoUrl,
      },
      include: {
        department: true,
        position: true,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if employee exists
    const existing = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Soft delete - update status
    await prisma.employee.update({
      where: { id },
      data: { status: 'terminated' },
    });

    // Optionally delete user account
    if (existing.userId) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ message: 'Employee terminated successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}

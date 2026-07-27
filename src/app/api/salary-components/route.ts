// ============================================
// Salary Components API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/salary-components
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // earning, deduction, tax
    const isActive = searchParams.get('isActive');

    const where: any = {};
    
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';

    const components = await prisma.salaryComponent.findMany({
      where,
      orderBy: [{ type: 'asc' }, { priority: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching salary components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salary components' },
      { status: 500 }
    );
  }
}

// POST /api/salary-components
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'code', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate code
    const existing = await prisma.salaryComponent.findUnique({
      where: { code: body.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Component code already exists' },
        { status: 400 }
      );
    }

    const component = await prisma.salaryComponent.create({
      data: {
        name: body.name,
        code: body.code,
        type: body.type,
        category: body.category,
        isActive: body.isActive ?? true,
        isTaxable: body.isTaxable ?? true,
        isBpjsSubject: body.isBpjsSubject ?? true,
        calculationType: body.calculationType ?? 'fixed',
        defaultValue: body.defaultValue ?? 0,
        maxValue: body.maxValue,
        formula: body.formula,
        priority: body.priority ?? 0,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error('Error creating salary component:', error);
    return NextResponse.json(
      { error: 'Failed to create salary component' },
      { status: 500 }
    );
  }
}

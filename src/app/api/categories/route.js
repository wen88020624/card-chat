import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { cards: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(request) {
  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: 'Category already exists' },
      { status: 409 },
    );
  }

  const category = await prisma.category.create({ data: { name } });
  return NextResponse.json(category, { status: 201 });
}

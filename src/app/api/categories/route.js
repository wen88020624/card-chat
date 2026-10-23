import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const categories = await prisma.category.findMany({
    where: { userId },
    include: { _count: { select: { cards: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({
    where: { name_userId: { name, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
  }

  const category = await prisma.category.create({ data: { name, userId } });
  return NextResponse.json(category, { status: 201 });
}

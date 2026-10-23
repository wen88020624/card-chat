import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(_, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id), userId },
    include: { cards: { orderBy: { stars: 'desc' } } },
  });

  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { id } = await params;
  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({
    where: { id: Number(id), userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { name },
  });

  return NextResponse.json(category);
}

export async function DELETE(_, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { id } = await params;
  const existing = await prisma.category.findUnique({
    where: { id: Number(id), userId },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.category.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

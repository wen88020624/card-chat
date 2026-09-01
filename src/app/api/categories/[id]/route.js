import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_, { params }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { cards: { orderBy: { stars: 'desc' } } },
  });

  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { name },
  });

  return NextResponse.json(category);
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  await prisma.category.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

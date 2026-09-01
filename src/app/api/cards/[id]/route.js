import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_, { params }) {
  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });

  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { content, stars, categoryId } = await request.json();

  const data = {};
  if (content !== undefined) data.content = content;
  if (stars !== undefined) data.stars = Number(stars);
  if (categoryId !== undefined) data.categoryId = Number(categoryId);

  const card = await prisma.card.update({
    where: { id: Number(id) },
    data,
    include: { category: true },
  });

  return NextResponse.json(card);
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  await prisma.card.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

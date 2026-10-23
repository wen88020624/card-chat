import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(_, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });

  if (!card || card.category.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id: Number(id) },
    include: { category: { select: { userId: true } } },
  });

  if (!card || card.category.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { content, stars, categoryId } = await request.json();

  const data = {};
  if (content !== undefined) {
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    data.content = content;
  }
  if (stars !== undefined) {
    const n = Number(stars);
    if (!Number.isInteger(n) || n < 1 || n > 4) {
      return NextResponse.json({ error: 'Stars must be between 1 and 4' }, { status: 400 });
    }
    data.stars = n;
  }
  if (categoryId !== undefined) {
    // The target category must belong to the same user
    const target = await prisma.category.findUnique({
      where: { id: Number(categoryId), userId },
    });
    if (!target) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    data.categoryId = target.id;
  }

  const updated = await prisma.card.update({
    where: { id: Number(id) },
    data,
    include: { category: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: '未授權' }, { status: 401 });
  const userId = Number(session.user.id);

  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id: Number(id) },
    include: { category: { select: { userId: true } } },
  });

  if (!card || card.category.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}

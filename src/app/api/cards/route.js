import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryIds = searchParams.getAll('categoryId').map(Number);
  const stars = searchParams.getAll('stars').map(Number);

  const where = {};
  if (categoryIds.length > 0) where.categoryId = { in: categoryIds };
  if (stars.length > 0) where.stars = { in: stars };

  const cards = await prisma.card.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(cards);
}

export async function POST(request) {
  const { content, stars, categoryId } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  if (!categoryId) {
    return NextResponse.json(
      { error: 'Category is required' },
      { status: 400 },
    );
  }

  if (!stars || stars < 1 || stars > 4) {
    return NextResponse.json(
      { error: 'Stars must be between 1 and 4' },
      { status: 400 },
    );
  }

  const card = await prisma.card.create({
    data: { content, stars: Number(stars), categoryId: Number(categoryId) },
    include: { category: true },
  });

  return NextResponse.json(card, { status: 201 });
}

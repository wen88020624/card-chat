import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { normalizeEmail } from '@/auth';
import prisma from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }

  const email = normalizeEmail(body?.email);
  const password = body?.password;

  if (!email || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: '請填寫所有欄位' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '電子郵件格式不正確' }, { status: 400 });
  }
  // bcrypt only uses the first 72 bytes
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json(
      { error: '密碼需為 8 到 72 個字元' },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: '此電子郵件已被使用' }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    // Unique violation from a concurrent registration
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: '此電子郵件已被使用' }, { status: 409 });
    }
    throw err;
  }
}

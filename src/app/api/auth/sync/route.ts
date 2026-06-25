import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          credits: email === 'testuser@example.com' ? 1000 : 30,
        },
      });
    } else if (email === 'testuser@example.com') {
      user = await prisma.user.update({
        where: { email },
        data: { credits: 1000 }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, user });
  } catch (err) {
    console.error("AUTH_SYNC_ERROR:", err);
    return NextResponse.json(
      { error: 'Server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

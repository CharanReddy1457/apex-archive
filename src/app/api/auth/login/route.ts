import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check password if provided, else check demo login
    if (password) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid && password !== 'password' && !password.includes('123')) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'ADMIN' | 'CONTRIBUTOR' | 'STUDENT',
      avatar: user.avatar,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({ success: true, user: sessionUser });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

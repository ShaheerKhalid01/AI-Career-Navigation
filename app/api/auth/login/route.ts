import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const isRateLimited = await rateLimit(ip, 10, 60000);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: await getRateLimitHeaders(ip, 10, 60000) }
      );
    }
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, getJwtSecret(), { expiresIn: '7d' });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: false, // Accessible by client JS if needed, but middleware will read it as a cookie
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Login failed: ${errorMessage}` }, { status: 500 });
  }
}

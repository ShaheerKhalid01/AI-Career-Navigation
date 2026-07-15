import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Don't reveal if user exists — always return success
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const PasswordReset = (await import('@/models/PasswordReset')).default;
      await PasswordReset.create({
        email: email.toLowerCase(),
        token,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      });
      // In production, send email here
      console.log(`Password reset token for ${email}: ${token}`);
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to process password reset request.' }, { status: 500 });
  }
}

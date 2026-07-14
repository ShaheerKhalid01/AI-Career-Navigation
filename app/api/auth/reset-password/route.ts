import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const PasswordReset = (await import('@/models/PasswordReset')).default;
    const reset = await PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
    if (!reset) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ email: reset.email }, { password: hashedPassword });
    reset.used = true;
    await reset.save();

    return NextResponse.json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

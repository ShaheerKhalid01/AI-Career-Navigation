import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
      
      // Generate new token with same payload
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token: newToken,
        user: { id: decoded.userId, email: decoded.email }
      });
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}

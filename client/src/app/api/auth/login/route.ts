// client/src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    // Compare with your .env password
    if (password === process.env.ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true }, { status: 200 });
      
      // Grant the secure HttpOnly cookie
      response.cookies.set({
        name: 'admin_token',
        value: 'authenticated', // In a multi-user app, this would be a JWT
        httpOnly: true, // Prevents JavaScript hackers from stealing the cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week duration
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
// client/src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Destroy the cookie
  response.cookies.delete('admin_token');
  
  return response;
}
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // 1. THE BOUNCER: Check if the user is logged into Vercel
  // ⚡ NEXT.JS UPDATE: We must 'await' cookies() here!
  const cookieStore = await cookies();
  
  // NOTE: If your /api/auth/login route sets a differently named cookie, 
  // change 'admin_token' to match your actual cookie name!
  const adminToken = cookieStore.get('admin_token');

  if (!adminToken) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin login required.' }, 
      { status: 401 }
    );
  }

  // 2. THE PROXY: If verified, Vercel securely forwards the data to Render
  try {
    const body = await request.json();
    
    // Fallback to localhost if the environment variable isn't found
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') // Prevents accidental double /api/api
      : 'http://localhost:5000';

    const backendRes = await fetch(`${baseUrl}/api/regions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
    
  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return NextResponse.json({ error: 'Failed to reach Render backend' }, { status: 500 });
  }
}
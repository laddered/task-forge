import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  // Удаляем cookie session
  const cookie = serialize('session', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 0,
  });
  const res = NextResponse.json({ message: 'Logged out' });
  res.headers.set('Set-Cookie', cookie);
  return res;
} 
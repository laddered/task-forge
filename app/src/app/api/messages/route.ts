import { NextResponse } from 'next/server';
import { prisma } from '../../../prismaClient';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { receiverId, content } = body;
  if (!receiverId || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const message = await prisma.message.create({
    data: {
      senderId: session,
      receiverId,
      text: content,
    },
    select: { id: true, senderId: true, receiverId: true, text: true, timestamp: true },
  });
  return NextResponse.json({ message }, { status: 201 });
} 
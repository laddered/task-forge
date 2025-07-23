import { NextResponse } from 'next/server';
import { prisma } from '../../../../prismaClient';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Получаем все сообщения, где пользователь отправитель или получатель
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session },
        { receiverId: session },
      ],
    },
    select: {
      senderId: true,
      receiverId: true,
      sender: { select: { id: true, name: true, email: true } },
      receiver: { select: { id: true, name: true, email: true } },
    },
  });
  // Собираем уникальных собеседников
  const chatUsersMap = new Map();
  for (const msg of messages) {
    const otherUser: { id: string; name: string | null; email: string } = msg.senderId === session ? msg.receiver : msg.sender;
    if (otherUser.id !== session) {
      chatUsersMap.set(otherUser.id, otherUser);
    }
  }
  const chatUsers = Array.from(chatUsersMap.values());
  return NextResponse.json({ chatUsers });
} 
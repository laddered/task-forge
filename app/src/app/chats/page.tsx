import { cookies } from "next/headers";
import { prisma } from '../../prismaClient';
import ClientChats from './ClientChats';

export default async function ChatsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return <div className="p-8">Необходимо войти в систему.</div>;
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

  // Получаем всех пользователей, кроме себя
  const allUsers = await prisma.user.findMany({
    where: { NOT: { id: session } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  return <ClientChats chatUsers={chatUsers} userId={session} allUsers={allUsers} />;
} 
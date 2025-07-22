import { cookies } from "next/headers";
import { prisma } from '../../prismaClient';
import Link from 'next/link';

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

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Ваши чаты</h1>
      <ul className="space-y-2">
        {chatUsers.map((user) => (
          <li key={user.id}>
            <Link href={`#`} className="text-blue-600 hover:underline">
              {user.name || user.email}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
} 
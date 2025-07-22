import { cookies } from "next/headers";
import { prisma } from '../../prismaClient';
import ClientBoards from './ClientBoards';

export default async function BoardsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return <div className="p-8">Необходимо войти в систему.</div>;
  }
  const boards = await prisma.board.findMany({
    where: { ownerId: session },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  // Переходим на клиентский компонент для управления состоянием
  return <ClientBoards boards={boards} userId={session} />;
} 
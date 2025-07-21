import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import ClientHome from "./ClientHome";

const prisma = new PrismaClient();

async function getCurrentUser(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session }, select: { email: true } });
  if (!user) return null;
  return { email: user.email };
}

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    return <ClientHome email={user.email} />;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Task Forge</h1>
      <p className="mb-4 text-lg">Добро пожаловать! Войдите или зарегистрируйтесь, чтобы начать работать с задачами.</p>
      <div className="flex gap-4">
        <a href="/login" className="bg-black text-white rounded px-4 py-2">Войти</a>
        <a href="/register" className="bg-gray-200 text-black rounded px-4 py-2">Зарегистрироваться</a>
      </div>
    </div>
  );
}

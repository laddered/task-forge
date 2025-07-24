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
  // if (user) {
  //   return <ClientHome email={user.email} />;
  // }
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 mx-auto max-w-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Task Forge</h1>
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-300 text-center">
        {user
          ? `Добро пожаловать, ${user.email}!`
          : "Добро пожаловать! Войдите или зарегистрируйтесь, чтобы начать работать с задачами."}
      </p>
      {!user && (
        <div className="flex gap-4">
          <a href="/login" className="text-gray-900 dark:text-gray-100 px-6 py-2 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Войти</a>
          <a href="/register" className="text-gray-900 dark:text-gray-100 px-6 py-2 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Зарегистрироваться</a>
        </div>
      )}
    </div>
  );
}

import { NextResponse } from 'next/server';
import { prisma } from '../../../prismaClient';
import { cookies } from 'next/headers';

// Получить список досок пользователя
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Получаем доски, принадлежащие пользователю
  const boards = await prisma.board.findMany({
    where: { ownerId: session },
    orderBy: { id: 'asc' },
    select: { id: true, name: true },
  });
  return NextResponse.json({ boards });
}

// Создать новую доску
export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Создаём доску с дефолтным именем
  const board = await prisma.board.create({
    data: { name: 'Новая доска', ownerId: session },
    select: { id: true, name: true },
  });
  return NextResponse.json({ board }, { status: 201 });
}

// Удалить доску по id
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  // Удаляем доску только если она принадлежит пользователю
  await prisma.board.delete({
    where: { id, ownerId: session },
  });
  return NextResponse.json({ success: true });
}

// Переименовать доску по id
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { id, name } = body;
  // Проверка id
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  // Проверка имени (строка, не пустая, <= 20 символов)
  if (!name || typeof name !== 'string' || name.length === 0 || name.length > 20) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  try {
    // Обновляем имя доски только если она принадлежит пользователю
    const board = await prisma.board.update({
      where: { id, ownerId: session },
      data: { name },
      select: { id: true, name: true },
    });
    return NextResponse.json({ board });
  } catch (e) {
    return NextResponse.json({ error: 'Board not found or update failed' }, { status: 404 });
  }
} 
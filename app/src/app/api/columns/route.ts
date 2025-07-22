import { NextResponse } from 'next/server';
import { prisma } from '../../../prismaClient';
import { cookies } from 'next/headers';

// Получить колонки по boardId
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');
  if (!boardId) {
    return NextResponse.json({ error: 'Missing boardId' }, { status: 400 });
  }
  // Проверяем, что доска принадлежит пользователю
  const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Board not found or forbidden' }, { status: 404 });
  }
  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true },
  });
  return NextResponse.json({ columns });
}

// Создать новую колонку
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { boardId, title } = body;
  if (!boardId || typeof boardId !== 'string') {
    return NextResponse.json({ error: 'Missing boardId' }, { status: 400 });
  }
  if (!title || typeof title !== 'string' || title.length === 0 || title.length > 20) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
  }
  // Проверяем, что доска принадлежит пользователю
  const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Board not found or forbidden' }, { status: 404 });
  }
  // Определяем максимальный order
  const maxOrder = await prisma.column.aggregate({
    where: { boardId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;
  const column = await prisma.column.create({
    data: { boardId, title, order },
    select: { id: true, title: true, order: true },
  });
  return NextResponse.json({ column }, { status: 201 });
}

// Переименовать колонку
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { id, title } = body;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  if (!title || typeof title !== 'string' || title.length === 0 || title.length > 20) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
  }
  // Проверяем, что колонка принадлежит доске пользователя
  const column = await prisma.column.findUnique({ where: { id } });
  if (!column) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 });
  }
  const board = await prisma.board.findFirst({ where: { id: column.boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const updated = await prisma.column.update({
    where: { id },
    data: { title },
    select: { id: true, title: true, order: true },
  });
  return NextResponse.json({ column: updated });
}

// Удалить колонку
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  // Проверяем, что колонка принадлежит доске пользователя
  const column = await prisma.column.findUnique({ where: { id } });
  if (!column) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 });
  }
  const board = await prisma.board.findFirst({ where: { id: column.boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.column.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 
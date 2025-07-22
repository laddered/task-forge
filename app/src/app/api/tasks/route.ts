import { NextResponse } from 'next/server';
import { prisma } from '../../../prismaClient';
import { cookies } from 'next/headers';

// Получить задачи по columnId
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const columnId = searchParams.get('columnId');
  if (!columnId) {
    return NextResponse.json({ error: 'Missing columnId' }, { status: 400 });
  }
  // Проверяем, что колонка принадлежит доске пользователя
  const column = await prisma.column.findUnique({ where: { id: columnId }, include: { board: true } });
  if (!column) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 });
  }
  const board = await prisma.board.findFirst({ where: { id: column.boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const tasks = await prisma.task.findMany({
    where: { columnId },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, description: true, order: true },
  });
  return NextResponse.json({ tasks });
}

// Создать новую задачу
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { columnId, title, description, order } = body;
  if (!columnId || typeof columnId !== 'string') {
    return NextResponse.json({ error: 'Missing columnId' }, { status: 400 });
  }
  // Проверяем, что колонка принадлежит доске пользователя
  const column = await prisma.column.findUnique({ where: { id: columnId }, include: { board: true } });
  if (!column) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 });
  }
  const board = await prisma.board.findFirst({ where: { id: column.boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Определяем order
  let newOrder = order;
  if (!newOrder) {
    const maxOrder = await prisma.task.aggregate({
      where: { columnId },
      _max: { order: true },
    });
    newOrder = (maxOrder._max.order ?? 0) + 1;
  }
  const task = await prisma.task.create({
    data: {
      columnId,
      title: title || 'Новый таск',
      description: description || 'Измени описание',
      order: newOrder,
    },
    select: { id: true, title: true, description: true, order: true },
  });
  return NextResponse.json({ task }, { status: 201 });
}

// Обновить задачу (название/описание)
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  console.log('[PATCH /api/tasks] body:', body);
  const { id, title, description, order, columnId } = body;
  if (!id || typeof id !== 'string') {
    console.log('[PATCH /api/tasks] Missing id');
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const task = await prisma.task.findUnique({ where: { id }, include: { column: { include: { board: true } } } });
  console.log('[PATCH /api/tasks] found task:', task);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  const board = await prisma.board.findFirst({ where: { id: task.column.boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(order !== undefined && { order }),
      ...(columnId !== undefined && { columnId }),
    },
    select: { id: true, title: true, description: true, order: true, columnId: true },
  });
  console.log('[PATCH /api/tasks] updated task:', updated);
  return NextResponse.json({ task: updated });
}

// Удалить задачу и пересчитать order
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
  const task = await prisma.task.findUnique({ where: { id }, include: { column: { include: { board: true, tasks: true } } } });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  const board = await prisma.board.findFirst({ where: { id: task.column.boardId, ownerId: session } });
  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Удаляем задачу
  await prisma.task.delete({ where: { id } });
  // Пересчитываем order для оставшихся задач
  const tasks = await prisma.task.findMany({
    where: { columnId: task.columnId },
    orderBy: { order: 'asc' },
  });
  for (let i = 0; i < tasks.length; i++) {
    await prisma.task.update({ where: { id: tasks[i].id }, data: { order: i + 1 } });
  }
  return NextResponse.json({ success: true });
} 
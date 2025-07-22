import { NextResponse } from 'next/server';
import { prisma } from '../../../prismaClient';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const boards = await prisma.board.findMany({
    where: { ownerId: session },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return NextResponse.json({ boards });
}

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const board = await prisma.board.create({
    data: { name: 'Новая доска', ownerId: session },
    select: { id: true, name: true },
  });
  return NextResponse.json({ board }, { status: 201 });
}

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
  await prisma.board.delete({
    where: { id, ownerId: session },
  });
  return NextResponse.json({ success: true });
} 
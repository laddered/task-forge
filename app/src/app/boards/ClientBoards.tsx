"use client";
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function ClientBoards({ boards: initialBoards, userId }: { boards: { id: string, name: string }[]; userId: string }) {
  const [boards, setBoards] = useState(initialBoards);

  async function refreshBoards() {
    const res = await fetch("/api/boards");
    if (res.ok) {
      const data = await res.json();
      setBoards(data.boards);
    }
  }

  return (
    <main className="p-8 flex flex-col">
      <h1 className="text-2xl font-bold">Ваши доски</h1>
      <div className="flex">
        <Sidebar
          boards={boards}
          userId={userId}
          onBoardCreated={refreshBoards}
          onBoardDeleted={refreshBoards}
        />
        <section className="flex-1 p-8">
          {/* Здесь можно добавить отображение выбранной доски */}
        </section>
      </div>
    </main>
  );
} 
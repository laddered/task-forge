"use client";
import React, { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Header({ email }: { email?: string }) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    function handler(e: any) {
      setUnread(e.detail || 0);
    }
    window.addEventListener('chats-unread', handler);
    return () => window.removeEventListener('chats-unread', handler);
  }, []);
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-gray-800 border-b">
      <div className="text-xl font-bold text-white">Task Forge</div>
      <nav className="flex gap-4">
        <a href="/boards" className="text-gray-300 hover:text-white">Boards</a>
        <a href="/chats" className="text-gray-300 hover:text-white relative">
          Chats
          {unread > 0 && (
            <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 align-middle">{unread}</span>
          )}
        </a>
      </nav>
      {email ? (
        <div className="flex items-center gap-4">
          <div className="text-gray-200">{email}</div>
          <LogoutButton />
        </div>
      ) : null}
    </header>
  );
} 
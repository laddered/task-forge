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
    <header className="w-full flex items-center justify-between px-8 py-4 bg-gray-800 border-b relative">
      <div className="text-xl font-bold text-white z-10">Task Forge</div>
      {email && (
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8 bg-gray-700 rounded-full px-8 py-2 shadow-lg z-0">
          <a
            href="/boards"
            className="text-gray-200 font-medium px-4 py-1 rounded-full transition-colors duration-200 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            Boards
          </a>
          <a
            href="/chats"
            className="text-gray-200 font-medium px-4 py-1 rounded-full transition-colors duration-200 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 relative cursor-pointer"
          >
            Chats
            {unread > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 align-middle shadow-md border border-white">{unread}</span>
            )}
          </a>
        </nav>
      )}
      {email ? (
        <div className="flex items-center gap-4 z-10">
          <div className="text-gray-200">{email}</div>
          <LogoutButton />
        </div>
      ) : null}
    </header>
  );
} 
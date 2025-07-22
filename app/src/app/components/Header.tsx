"use client";
import React from "react";
import LogoutButton from "./LogoutButton";

export default function Header({ email }: { email?: string }) {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-gray-800 border-b">
      <div className="text-xl font-bold text-white">Task Forge</div>
      <nav className="flex gap-4">
        <a href="/boards" className="text-gray-300 hover:text-white">Boards</a>
        <a href="/chats" className="text-gray-300 hover:text-white">Chats</a>
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
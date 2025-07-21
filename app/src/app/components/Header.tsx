"use client";
import React from "react";

export default function Header({ email }: { email?: string }) {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-gray-100 border-b">
      <div className="text-xl font-bold">Task Forge</div>
      {email ? (
        <div className="text-gray-700">{email}</div>
      ) : null}
    </header>
  );
} 
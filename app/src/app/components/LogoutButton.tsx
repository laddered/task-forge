"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleLogout() {
    setLoading(true);
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
    setLoading(false);
  }
  return (
    <button
      onClick={handleLogout}
        className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-4 py-2 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
      disabled={loading}
    >
      {loading ? "Выход..." : "Выйти"}
    </button>
  );
} 
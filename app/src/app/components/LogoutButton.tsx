"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleLogout() {
    setLoading(true);
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
    setLoading(false);
  }
  return (
    <button
      onClick={handleLogout}
      className="bg-black text-white rounded px-4 py-2 disabled:opacity-50 cursor-pointer"
      disabled={loading}
    >
      {loading ? "Выход..." : "Выйти"}
    </button>
  );
} 
"use client";
import LogoutButton from "./components/LogoutButton";

export default function ClientHome({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Добро пожаловать!</h1>
      <p className="mb-4">Вы вошли как <b>{email}</b></p>
      <LogoutButton />
    </div>
  );
} 
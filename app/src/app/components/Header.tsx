"use client";
import React, { useEffect, useState, useRef } from "react";
import LogoutButton from "./LogoutButton";

export default function Header({ email, name }: { email?: string, name?: string }) {
  const [unread, setUnread] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: any) {
      setUnread(e.detail || 0);
    }
    window.addEventListener('chats-unread', handler);
    return () => window.removeEventListener('chats-unread', handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Language and theme toggles (stub logic)
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-gray-800 border-b relative">
      <div className="text-xl font-bold text-white z-10">Task Forge</div>
      {email && (
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6 bg-gray-800 rounded-lg px-5 py-2 shadow-2xl z-0">
          <a
            href="/boards"
            className="text-gray-100 font-semibold px-5 py-2 rounded-lg bg-gray-700 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all duration-200 cursor-pointer text-base tracking-wide"
          >
            Boards
          </a>
          <a
            href="/chats"
            className="text-gray-100 font-semibold px-5 py-2 rounded-lg bg-gray-700 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow relative transition-all duration-200 cursor-pointer text-base tracking-wide"
          >
            Chats
            {unread > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 align-middle shadow-md border border-white">{unread}</span>
            )}
          </a>
        </nav>
      )}
      {email ? (
        <div className="flex items-center gap-4 z-10 relative">
          <button
            className="flex items-center gap-2 text-gray-200 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="font-medium">{name || email}</span>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l8 8 8-8" /></svg>
          </button>
          {dropdownOpen && (
            <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-gray-100 rounded-xl shadow-2xl border border-gray-800 py-4 px-6 z-50 flex flex-col gap-4">
              <div className="text-xs text-gray-400 mb-2 select-text break-all">{email}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Язык</span>
                <label className="flex items-center cursor-pointer select-none">
                  <span className="mr-2 text-xs font-medium text-gray-400">RU</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={lang === 'en'}
                      onChange={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                      className="sr-only"
                    />
                    <span className={`block w-10 h-6 rounded-full transition-colors duration-200 ${lang === 'en' ? 'bg-blue-600' : 'bg-gray-700'}`}></span>
                    <span className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${lang === 'en' ? 'translate-x-4' : ''}`}></span>
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-400">EN</span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Тема</span>
                <label className="flex items-center cursor-pointer select-none">
                  <span className="mr-2 text-xs font-medium text-gray-400">🌙</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={theme === 'light'}
                      onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="sr-only"
                    />
                    <span className={`block w-10 h-6 rounded-full transition-colors duration-200 ${theme === 'light' ? 'bg-yellow-400' : 'bg-gray-700'}`}></span>
                    <span className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${theme === 'light' ? 'translate-x-4' : ''}`}></span>
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-400">☀️</span>
                </label>
              </div>
              <div className="border-t border-gray-800 pt-4 mt-2">
                <form action="/api/logout" method="POST">
                  <button type="submit" className="w-full text-left px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium transition-colors">Выйти</button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
} 
"use client";
import React, { useEffect, useState, useRef } from "react";
import LogoutButton from "./LogoutButton";
import { useTheme } from 'next-themes';

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
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-gray-300 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100 z-10">Task Forge</div>
      {email && (
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6 bg-white dark:bg-gray-900 rounded-lg px-5 py-2 shadow-2xl z-0">
          <a
            href="/boards"
            className="text-gray-800 dark:text-gray-200 font-semibold px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-blue-700 hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow transition-all duration-200 cursor-pointer text-base tracking-wide"
          >
            Boards
          </a>
          <a
            href="/chats"
            className="text-gray-800 dark:text-gray-200 font-semibold px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-blue-700 hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow relative transition-all duration-200 cursor-pointer text-base tracking-wide"
          >
            Chats
            {unread > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full px-2 py-0.5 align-middle shadow-md border border-white dark:border-gray-900">{unread}</span>
            )}
          </a>
        </nav>
      )}
      {email ? (
        <div className="flex items-center gap-4 z-10 relative">
          <button
            className="flex items-center gap-2 text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span className="font-medium">{name || email}</span>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l8 8 8-8" /></svg>
          </button>
          {dropdownOpen && (
            <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-400 py-4 px-6 z-50 flex flex-col gap-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 select-text break-all">{email}</div>
              {/* <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 dark:text-gray-200">Язык</span>
                <label className="flex items-center cursor-pointer select-none">
                  <span className="mr-2 text-xs font-medium text-gray-400 dark:text-gray-400">RU</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={lang === 'en'}
                      onChange={() => setLang(lang === 'ru' ? 'en' : 'ru')}
                      className="sr-only"
                    />
                    <span className={`block w-10 h-6 rounded-full transition-colors duration-200 ${lang === 'en' ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-700 dark:bg-gray-800'}`}></span>
                    <span className={`absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-200 rounded-full shadow transform transition-transform duration-200 ${lang === 'en' ? 'translate-x-4' : ''}`}></span>
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-400 dark:text-gray-400">EN</span>
                </label>
              </div> */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-300 font-medium">Тема</span>
                <label className="flex items-center cursor-pointer select-none">
                  <span className="mr-2 text-xs font-medium text-gray-400 dark:text-gray-400">🌙</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={theme === 'light'}
                      onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="sr-only"
                    />
                    <span className={`block w-10 h-6 rounded-full transition-colors duration-200 ${theme === 'light' ? 'bg-yellow-400 dark:bg-yellow-300' : 'bg-gray-700 dark:bg-gray-800'}`}></span>
                    <span className={`absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-200 rounded-full shadow transform transition-transform duration-200 ${theme === 'light' ? 'translate-x-4' : ''}`}></span>
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-400 dark:text-gray-400">☀️</span>
                </label>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10">
          <button
            className="flex items-center gap-2 text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Переключить тему"
          >
            {theme === 'light' ? (
              <span role="img" aria-label="Светлая тема">☀️</span>
            ) : (
              <span role="img" aria-label="Тёмная тема">🌙</span>
            )}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l8 8 8-8" /></svg>
          </button>
          {dropdownOpen && (
            <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-400 py-4 px-6 z-50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-300 font-medium">Тема</span>
                <label className="flex items-center cursor-pointer select-none">
                  <span className="mr-2 text-xs font-medium text-gray-400 dark:text-gray-400">🌙</span>
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={theme === 'light'}
                      onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="sr-only"
                    />
                    <span className={`block w-10 h-6 rounded-full transition-colors duration-200 ${theme === 'light' ? 'bg-yellow-400 dark:bg-yellow-300' : 'bg-gray-700 dark:bg-gray-800'}`}></span>
                    <span className={`absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-200 rounded-full shadow transform transition-transform duration-200 ${theme === 'light' ? 'translate-x-4' : ''}`}></span>
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-400 dark:text-gray-400">☀️</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
} 
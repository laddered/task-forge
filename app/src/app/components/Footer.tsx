"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full text-center py-4 mt-auto bg-gray-300 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100">
      © {new Date().getFullYear()} Task Forge
    </footer>
  );
} 
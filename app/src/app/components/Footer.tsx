"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full text-center py-4 mt-auto bg-gray-100 border-t text-gray-500 text-sm">
      © {new Date().getFullYear()} Task Forge
    </footer>
  );
} 
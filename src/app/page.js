"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to DocMarket</h1>
      <div className="space-x-4">
        <Link href="/login">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        </Link>
        <Link href="/register">
          <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
        </Link>
      </div>
    </main>
  );
}

"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async (e) => {
    e.preventDefault();
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 hover:underline w-full text-left"
    >
      Logout
    </button>
  );
}

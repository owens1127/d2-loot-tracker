"use client";

import { Button } from "@/components/ui/button";
import { useBungieSession } from "next-bungie-auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header = () => {
  const session = useBungieSession();
  const router = useRouter();

  return (
    <header className="bg-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <nav className="flex space-x-4">
            <Link
              href="/"
              className="text-zinc-100 hover:text-zinc-300 font-medium transition duration-150 ease-in-out"
            >
              Home
            </Link>
            <Link
              href="/inventory"
              className="text-zinc-100 hover:text-zinc-300 font-medium transition duration-150 ease-in-out"
            >
              Inventory
            </Link>
            <Link
              href="/perks"
              className="text-zinc-100 hover:text-zinc-300 font-medium transition duration-150 ease-in-out"
            >
              Perks
            </Link>
            <Link
              href="/rolls"
              className="text-zinc-100 hover:text-zinc-300 font-medium transition duration-150 ease-in-out"
            >
              Rolls
            </Link>
            <Link
              href="/players"
              className="text-zinc-100 hover:text-zinc-300 font-medium transition duration-150 ease-in-out"
            >
              Players
            </Link>
          </nav>
          {session.status === "authorized" ? (
            <Button
              className="bg-zinc-600 hover:bg-zinc-700 text-zinc-100 py-2 px-4 rounded-md transition duration-150 ease-in-out"
              onClick={() => {
                router.replace("/");
                session.kill();
              }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              className="bg-zinc-600 hover:bg-zinc-700 text-zinc-100 font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
              asChild
              disabled={session.status === "pending"}
            >
              <a
                href="/api/auth/authorize"
                className={
                  session.status === "pending"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                Sign In
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

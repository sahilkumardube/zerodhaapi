"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/positions", label: "Positions" },
  { href: "/orders", label: "Orders" },
  { href: "/strategy", label: "Strategy" },
  { href: "/risk", label: "Risk" },
  { href: "/logs", label: "Logs" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="font-semibold">Zerodha Auto Trader</div>
          <nav className="flex gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white",
                  pathname === link.href && "bg-zinc-800 text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/countries", label: "Countries" },
  { href: "/branches", label: "All Branches" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {LINKS.map((l) => {
        const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <a key={l.href} className={`nav-link ${active ? "active" : ""}`} href={l.href}>
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}

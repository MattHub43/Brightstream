"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      LINKS.map((l) => {
        const active =
          pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return { ...l, active };
      }),
    [pathname]
  );

  return (
    <div className="nav-wrap">
      {/* Desktop nav */}
      <nav className="nav-desktop" aria-label="Primary">
        <div className="nav-links">
          {items.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${l.active ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link href="/search" className="btn-primary">
          Get Started
        </Link>
      </nav>

      {/* Mobile nav */}
      <div className="nav-mobile">
        <button
          type="button"
          className="icon-btn"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hamburger" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div className="mobile-panel" role="dialog" aria-label="Menu">
          <div className="mobile-links">
            {items.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`mobile-link ${l.active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mobile-cta">
            <Link href="/search" className="btn-primary" onClick={() => setOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

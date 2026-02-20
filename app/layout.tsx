import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";



export const metadata: Metadata = {
  title: "Brightstream Branch Locator",
  description: "Bank branch locator powered by Optimizely GraphQL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="app-shell">
          <header className="header">
            <div className="header-inner">
              <div>
                <h1 className="brand-title">Brightstream</h1>
                <p className="brand-subtitle">Find a branch near you</p>
              </div>
              <NavBar />
            </div>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <div className="footer-inner">
              <span>Powered by Optimizely GraphQL</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

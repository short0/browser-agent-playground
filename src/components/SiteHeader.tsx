import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-primary"
          />
          <span>Browser Task Playground</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground font-medium" }}
          >
            Home
          </Link>
          <Link
            to="/playground"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground font-medium" }}
          >
            Playground
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-1.5 text-foreground font-medium" }}
          >
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

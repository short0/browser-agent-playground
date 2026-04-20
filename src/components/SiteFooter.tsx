import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>Browser Task Playground — a calm sandbox for agentic browsing.</p>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/playground" className="hover:text-foreground">Playground</Link>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Brain, ClipboardList, Eye, MousePointerClick, ShieldCheck, Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRESETS } from "@/data/presets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Browser Task Playground — See how browser agents think" },
      { name: "description", content: "A calm, hands-on sandbox to learn how agentic browsers plan, act, extract, and verify. Try mocked presets instantly — no setup." },
      { property: "og:title", content: "Browser Task Playground" },
      { property: "og:description", content: "A calm, hands-on sandbox for agentic browser workflows." },
    ],
  }),
  component: HomePage,
});

const STEPS = [
  { icon: Target, label: "Goal", desc: "What the user wants." },
  { icon: ClipboardList, label: "Plan", desc: "Break it into steps." },
  { icon: MousePointerClick, label: "Act", desc: "Click, type, navigate." },
  { icon: Eye, label: "Extract", desc: "Pull structured data." },
  { icon: ShieldCheck, label: "Verify", desc: "Check the result." },
];

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <Brain className="h-3.5 w-3.5" />
              Learn agentic browsing — visually
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Watch a browser agent plan, click, read, and verify — step by step.
            </h1>
            <p className="mt-5 text-balance text-base text-muted-foreground sm:text-lg">
              A calm sandbox with mocked runs you can explore instantly. No setup, no API keys required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate({ to: "/playground" })}>
                Open Playground <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">How it works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Try a preset</h2>
            <p className="hidden text-sm text-muted-foreground sm:block">Click one to launch instantly.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate({ to: "/playground", search: { preset: p.id } })}
                className="group text-left"
              >
                <Card className="h-full p-5 transition-all hover:border-primary/40 hover:shadow-md">
                  <div className="mb-3 text-2xl" aria-hidden>{p.emoji}</div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.goal}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>~{p.estimatedSteps} steps</span>
                    <span className="inline-flex items-center gap-1 text-primary opacity-0 transition group-hover:opacity-100">
                      Launch <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every run follows the same five phases.</p>
            <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {STEPS.map((s, i) => (
                <li key={s.label}>
                  <Card className="flex h-full flex-col gap-2 p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <s.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{s.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </Card>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Button onClick={() => navigate({ to: "/playground" })}>
                Open the playground <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

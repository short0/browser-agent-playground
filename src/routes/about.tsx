import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { StepBadge } from "@/components/StepBadge";
import { STEP_EXPLANATIONS } from "@/data/presets";
import type { StepType } from "@/data/presets";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Browser Task Playground" },
      { name: "description", content: "What browser agents are, how they work, and a glossary of planning, acting, extracting, and verifying." },
      { property: "og:title", content: "About — Browser Task Playground" },
      { property: "og:description", content: "Plain-language intro to agentic browser workflows." },
    ],
  }),
  component: AboutPage,
});

const TYPES: StepType[] = ["GOAL", "PLAN", "ACTION", "OBSERVATION", "EXTRACTION", "VERIFY"];

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-3 text-muted-foreground">
          A browser agent is a program that uses a web browser the way a person would — reading pages,
          clicking links, typing into forms, and pulling out information to complete a goal. This playground
          shows that loop in slow motion so you can see what the agent is thinking at each step.
        </p>

        <h2 className="mt-10 text-xl font-semibold tracking-tight">Glossary</h2>
        <div className="mt-4 grid gap-3">
          {TYPES.map((t) => (
            <Card key={t} className="p-4">
              <div className="flex items-center gap-2">
                <StepBadge type={t} />
                <span className="text-sm font-medium">{t.charAt(0) + t.slice(1).toLowerCase()}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{STEP_EXPLANATIONS[t]}</p>
            </Card>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold tracking-tight">Mocked vs Live mode</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The default <strong>Mocked mode</strong> uses pre-recorded runs so you can explore the loop instantly.
          <strong> Live LLM mode</strong> is an optional advanced setting where the agent's reasoning is generated
          by a real model using your own API key (stored only in your browser). Browser actions are still simulated.
        </p>

        <div className="mt-10">
          <Button asChild>
            <Link to="/playground">Open the playground</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

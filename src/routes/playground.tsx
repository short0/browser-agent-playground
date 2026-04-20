import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Redo2,
  Undo2,
  Repeat,
  Settings as SettingsIcon,
  Info,
  KeyRound,
  Sparkles,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { PRESETS, STEP_EXPLANATIONS, type RunStep } from "@/data/presets";
import { usePlayground, type Speed } from "@/lib/playground-store";
import { StepBadge } from "@/components/StepBadge";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  preset: z.string().optional(),
});

export const Route = createFileRoute("/playground")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Playground — Browser Task Playground" },
      { name: "description", content: "A 3-panel sandbox: control the agent, watch the run, inspect the outcome." },
      { property: "og:title", content: "Playground — Browser Task Playground" },
      { property: "og:description", content: "Plan, act, extract, verify — visualized." },
    ],
  }),
  component: PlaygroundPage,
});

const SPEED_MS: Record<Speed, number> = { slow: 1400, normal: 700, instant: 60 };

function PlaygroundPage() {
  const { preset: searchPreset } = Route.useSearch();
  const { state, preset, dispatch, undo, redo } = usePlayground();
  const [tab, setTab] = useState<"plan" | "run" | "result">("run");
  const [dataView, setDataView] = useState<"table" | "json">("table");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply ?preset= once on mount if it differs from saved
  const appliedPresetRef = useRef(false);
  useEffect(() => {
    if (appliedPresetRef.current) return;
    if (searchPreset && PRESETS.some((p) => p.id === searchPreset) && searchPreset !== state.selectedPresetId) {
      dispatch({ type: "SET_PRESET", presetId: searchPreset }, { track: true });
    }
    appliedPresetRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPreset]);

  const totalSteps = preset.steps.length;
  const currentIdx = state.currentStepIndex;
  const currentStep: RunStep | undefined = currentIdx >= 0 ? preset.steps[currentIdx] : undefined;
  const isRunning = state.status === "running";
  const isFinished = state.status === "verified" || state.status === "failed";

  // Auto-advance
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isRunning) return;
    if (!state.settings.autoAdvance) return;
    const next = currentIdx + 1;
    if (next >= totalSteps) {
      dispatch({
        type: "FINISH_RUN",
        record: {
          id: `${Date.now()}`,
          presetId: preset.id,
          goal: state.goal,
          finishedAt: Date.now(),
          finalAnswer: preset.finalAnswer,
          stepCount: totalSteps,
        },
      });
      return;
    }
    timerRef.current = setTimeout(() => {
      dispatch({ type: "SET_STEP", index: next });
    }, SPEED_MS[state.settings.speed]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, currentIdx, totalSteps, state.settings.autoAdvance, state.settings.speed, state.goal, preset, dispatch]);

  const handleRun = () => {
    if (currentIdx < 0 || currentIdx >= totalSteps - 1) {
      dispatch({ type: "SET_STEP", index: 0 });
    }
    dispatch({ type: "SET_STATUS", status: "running" });
  };
  const handlePause = () => dispatch({ type: "SET_STATUS", status: "paused" });
  const handleStep = () => {
    const next = Math.min(currentIdx + 1, totalSteps - 1);
    dispatch({ type: "SET_STEP", index: next });
    if (next === totalSteps - 1) {
      dispatch({
        type: "FINISH_RUN",
        record: {
          id: `${Date.now()}`,
          presetId: preset.id,
          goal: state.goal,
          finishedAt: Date.now(),
          finalAnswer: preset.finalAnswer,
          stepCount: totalSteps,
        },
      });
    } else {
      dispatch({ type: "SET_STATUS", status: "paused" });
    }
  };
  const handleReplay = () => {
    dispatch({ type: "SET_STEP", index: 0 }, { track: true });
    dispatch({ type: "SET_STATUS", status: "running" });
  };
  const handleReset = () => {
    dispatch({ type: "RESET_SESSION" }, { track: true });
  };

  const progress = totalSteps > 0 ? Math.max(0, ((currentIdx + 1) / totalSteps) * 100) : 0;
  const visibleSteps = currentIdx >= 0 ? preset.steps.slice(0, currentIdx + 1) : [];
  const allExtracted = visibleSteps.flatMap((s) => {
    if (!s.extracted) return [];
    return Array.isArray(s.extracted) ? s.extracted : [s.extracted];
  });

  const ControlPanel = (
    <ControlPanelView
      state={state}
      preset={preset}
      dispatch={dispatch}
      onRun={handleRun}
      onPause={handlePause}
      onStep={handleStep}
      onReplay={handleReplay}
      onReset={handleReset}
      onUndo={undo}
      onRedo={redo}
      isRunning={isRunning}
    />
  );

  const RunPanel = (
    <RunView
      preset={preset}
      visibleSteps={visibleSteps}
      currentIdx={currentIdx}
      currentStep={currentStep}
      allExtracted={allExtracted}
      dataView={dataView}
      setDataView={setDataView}
    />
  );

  const ResultPanel = (
    <ResultView
      state={state}
      preset={preset}
      progress={progress}
      isFinished={isFinished}
      currentIdx={currentIdx}
    />
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />

        {state.mode === "live" && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
            <Sparkles className="mr-1 inline h-3 w-3" /> Live mode — using your API key. Mocked actions only.
          </div>
        )}

        {/* Mobile sticky bar */}
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2 px-3 py-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Open controls">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto p-0">
                <div className="p-4">{ControlPanel}</div>
              </SheetContent>
            </Sheet>
            <Badge variant="outline" className="font-normal">
              {preset.emoji} {preset.name}
            </Badge>
            <div className="ml-auto flex items-center gap-1">
              {isRunning ? (
                <Button size="sm" variant="outline" onClick={handlePause}>
                  <Pause className="h-3.5 w-3.5" /> Pause
                </Button>
              ) : (
                <Button size="sm" onClick={handleRun}>
                  <Play className="h-3.5 w-3.5" /> Run
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={handleReset} aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="px-3 pb-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plan">Plan</TabsTrigger>
              <TabsTrigger value="run">Run</TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile content (tabs) */}
        <div className="flex-1 lg:hidden">
          <div className="px-3 pb-6 pt-3">
            {tab === "plan" && <PlanList preset={preset} currentIdx={currentIdx} />}
            {tab === "run" && RunPanel}
            {tab === "result" && ResultPanel}
          </div>
        </div>

        {/* Desktop / tablet 3-panel */}
        <div className="hidden flex-1 lg:block">
          <div className="mx-auto grid max-w-[1600px] grid-cols-[280px_1fr_360px] gap-0">
            <aside className="border-r border-border p-4">
              <ScrollArea className="h-[calc(100vh-3.5rem)] pr-3">{ControlPanel}</ScrollArea>
            </aside>
            <section className="p-4">{RunPanel}</section>
            <aside className="border-l border-border p-4">
              <ScrollArea className="h-[calc(100vh-3.5rem)] pr-3">{ResultPanel}</ScrollArea>
            </aside>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ---------- Control panel ---------- */

interface ControlProps {
  state: ReturnType<typeof usePlayground>["state"];
  preset: ReturnType<typeof usePlayground>["preset"];
  dispatch: ReturnType<typeof usePlayground>["dispatch"];
  onRun: () => void;
  onPause: () => void;
  onStep: () => void;
  onReplay: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  isRunning: boolean;
}

function ControlPanelView({ state, preset, dispatch, onRun, onPause, onStep, onReplay, onReset, onUndo, onRedo, isRunning }: ControlProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Controls</h2>
        <div className="flex items-center gap-1">
          <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={onUndo} aria-label="Undo"><Undo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Undo (⌘Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={onRedo} aria-label="Redo"><Redo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Redo (⇧⌘Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" onClick={onReset} aria-label="Reset session"><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Reset session</TooltipContent></Tooltip>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Preset</Label>
        <Select value={state.selectedPresetId} onValueChange={(v) => dispatch({ type: "SET_PRESET", presetId: v }, { track: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.emoji}  {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground" htmlFor="goal-input">Goal</Label>
        <Textarea
          id="goal-input"
          value={state.goal}
          onChange={(e) => dispatch({ type: "SET_GOAL", goal: e.target.value })}
          onBlur={(e) => dispatch({ type: "SET_GOAL", goal: e.target.value }, { track: true })}
          rows={3}
          className="resize-none text-sm"
        />
      </div>

      {/* Quick prompts */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Example prompts</Label>
        <div className="flex flex-wrap gap-1.5">
          {preset.examplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => dispatch({ type: "SET_GOAL", goal: `${preset.goal} — ${p}` }, { track: true })}
              className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Mode</Label>
          <Badge variant={state.mode === "mocked" ? "secondary" : "default"} className="text-[10px]">
            {state.mode === "mocked" ? "MOCKED" : "LIVE"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Live LLM</span>
          <Switch
            checked={state.mode === "live"}
            onCheckedChange={(v) => dispatch({ type: "SET_MODE", mode: v ? "live" : "mocked" }, { track: true })}
            aria-label="Toggle live LLM mode"
          />
        </div>
        {state.mode === "live" && (
          <div className="space-y-1.5 pt-1">
            <Label className="text-[11px] text-muted-foreground" htmlFor="api-key">
              <KeyRound className="mr-1 inline h-3 w-3" /> API key (stored locally)
            </Label>
            <Input
              id="api-key"
              type="password"
              value={state.apiKey}
              placeholder="sk-…"
              onChange={(e) => dispatch({ type: "SET_API_KEY", apiKey: e.target.value })}
              className="text-xs"
            />
            <p className="text-[10px] leading-snug text-muted-foreground">Reasoning may use your key. Browser actions remain simulated.</p>
          </div>
        )}
      </div>

      {/* Settings */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between px-2">
            <span className="flex items-center gap-2 text-xs"><SettingsIcon className="h-3.5 w-3.5" /> Settings</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Speed</Label>
            <Select value={state.settings.speed} onValueChange={(v) => dispatch({ type: "SET_SETTINGS", settings: { speed: v as Speed } }, { track: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="instant">Instant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground" htmlFor="auto-advance">Auto-advance</Label>
            <Switch id="auto-advance" checked={state.settings.autoAdvance} onCheckedChange={(v) => dispatch({ type: "SET_SETTINGS", settings: { autoAdvance: v } }, { track: true })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground" htmlFor="show-reasoning">Show reasoning</Label>
            <Switch id="show-reasoning" checked={state.settings.showReasoning} onCheckedChange={(v) => dispatch({ type: "SET_SETTINGS", settings: { showReasoning: v } }, { track: true })} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Run controls */}
      <div className="grid grid-cols-2 gap-2">
        {isRunning ? (
          <Button onClick={onPause} variant="outline" className="col-span-2"><Pause className="h-4 w-4" /> Pause</Button>
        ) : (
          <Button onClick={onRun} className="col-span-2"><Play className="h-4 w-4" /> Run</Button>
        )}
        <Button onClick={onStep} variant="outline" size="sm"><SkipForward className="h-4 w-4" /> Step</Button>
        <Button onClick={onReplay} variant="outline" size="sm"><Repeat className="h-4 w-4" /> Replay</Button>
      </div>

      {state.recentGoals.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Recent goals</Label>
          <ul className="space-y-1">
            {state.recentGoals.slice(0, 5).map((g) => (
              <li key={g}>
                <button
                  onClick={() => dispatch({ type: "SET_GOAL", goal: g }, { track: true })}
                  className="line-clamp-1 w-full rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {g}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Run view ---------- */

interface RunViewProps {
  preset: ReturnType<typeof usePlayground>["preset"];
  visibleSteps: RunStep[];
  currentIdx: number;
  currentStep?: RunStep;
  allExtracted: Array<Record<string, unknown>>;
  dataView: "table" | "json";
  setDataView: (v: "table" | "json") => void;
}

function RunView({ preset, visibleSteps, currentIdx, currentStep, allExtracted, dataView, setDataView }: RunViewProps) {
  return (
    <div className="space-y-4">
      {/* Browser frame */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="truncate">{currentStep?.url ?? "about:blank"}</span>
            </div>
          </div>
        </div>
        <div className="min-h-[180px] p-5 text-sm">
          {currentStep?.pageHtml ? (
            <div
              className="prose prose-sm max-w-none text-foreground [&_h3]:mt-0 [&_h3]:text-base [&_h3]:font-semibold [&_p]:text-muted-foreground [&_ul]:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: currentStep.pageHtml }}
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-muted-foreground">
              {currentIdx < 0 ? "Press Run to start the agent." : "No page rendered for this step."}
            </div>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Action timeline</h3>
          <span className="text-xs text-muted-foreground">{Math.max(0, currentIdx + 1)} / {preset.steps.length}</span>
        </div>
        <ol className="space-y-2">
          {preset.steps.map((step, idx) => {
            const reached = idx <= currentIdx;
            const active = idx === currentIdx;
            return (
              <li
                key={step.id}
                className={cn(
                  "rounded-md border p-3 transition",
                  active ? "border-primary/50 bg-primary/5" : reached ? "border-border bg-card" : "border-dashed border-border/60 bg-muted/20 opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex flex-col items-center">
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold", active ? "bg-primary text-primary-foreground" : reached ? "bg-muted text-foreground" : "bg-muted text-muted-foreground")}>
                      {idx + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StepBadge type={step.type} />
                      <span className="text-sm font-medium">{step.title}</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button aria-label="Explain this step" className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                            <Info className="h-3 w-3" /> Explain
                          </button>
                        </PopoverTrigger>
                        <PopoverContent side="left" className="w-72 text-xs">
                          <p className="font-medium">{step.type}</p>
                          <p className="mt-1 text-muted-foreground">{STEP_EXPLANATIONS[step.type]}</p>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Extracted data */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Extracted data</h3>
          <Tabs value={dataView} onValueChange={(v) => setDataView(v as "table" | "json")}>
            <TabsList className="h-7">
              <TabsTrigger value="table" className="h-5 px-2 text-xs">Table</TabsTrigger>
              <TabsTrigger value="json" className="h-5 px-2 text-xs">JSON</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {allExtracted.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing extracted yet.</p>
        ) : dataView === "json" ? (
          <pre className="max-h-72 overflow-auto rounded-md bg-muted/40 p-3 text-[11px] leading-relaxed">
{JSON.stringify(allExtracted, null, 2)}
          </pre>
        ) : (
          <DataTable rows={allExtracted} />
        )}
      </Card>
    </div>
  );
}

function DataTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  const cols = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [rows]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            {cols.map((c) => (
              <th key={c} className="px-2 py-1.5 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {cols.map((c) => (
                <td key={c} className="px-2 py-1.5 align-top">{formatCell(r[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(v: unknown) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/* ---------- Result view ---------- */

function ResultView({ state, preset, progress, isFinished, currentIdx }: {
  state: ReturnType<typeof usePlayground>["state"];
  preset: ReturnType<typeof usePlayground>["preset"];
  progress: number;
  isFinished: boolean;
  currentIdx: number;
}) {
  const status = state.status;
  const statusLabel: Record<typeof status, string> = {
    idle: "Idle",
    planning: "Planning",
    running: "Running",
    paused: "Paused",
    verified: "Verified",
    failed: "Failed",
  };
  const statusColor: Record<typeof status, string> = {
    idle: "bg-muted text-muted-foreground",
    planning: "bg-primary/15 text-primary",
    running: "bg-primary/15 text-primary",
    paused: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    verified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    failed: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-4" aria-live="polite">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Status</h3>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", statusColor[status])}>
            {statusLabel[status]}
          </span>
        </div>
        <Progress value={progress} className="mt-3 h-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          {currentIdx < 0 ? "Not started" : `${Math.max(0, currentIdx + 1)} of ${preset.steps.length} steps`}
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">Final answer</h3>
        {isFinished ? (
          <p className="mt-2 text-sm leading-relaxed">{preset.finalAnswer}</p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Will appear once verification passes.</p>
        )}
      </Card>

      {state.settings.showReasoning && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold">Reasoning</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {preset.reasoning.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-semibold">Verification</h3>
        <ul className="mt-2 space-y-1.5">
          {preset.verification.map((v) => (
            <li key={v.label} className="flex items-center gap-2 text-xs">
              {isFinished && v.pass ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : isFinished ? (
                <XCircle className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-dashed border-border" />
              )}
              <span className={cn(isFinished ? "text-foreground" : "text-muted-foreground")}>{v.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      {state.runHistory.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold">Run history</h3>
          <ul className="mt-2 space-y-2">
            {state.runHistory.slice(0, 5).map((r) => {
              const p = PRESETS.find((x) => x.id === r.presetId);
              return (
                <li key={r.id} className="rounded-md border border-border p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p?.emoji} {p?.name ?? r.presetId}</span>
                    <span className="text-muted-foreground">{new Date(r.finishedAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-muted-foreground">{r.goal}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ---------- Mobile plan list ---------- */

function PlanList({ preset, currentIdx }: { preset: ReturnType<typeof usePlayground>["preset"]; currentIdx: number }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">Plan</h3>
      <ol className="mt-3 space-y-2">
        {preset.steps.map((step, idx) => (
          <li
            key={step.id}
            className={cn(
              "rounded-md border p-3 text-sm",
              idx === currentIdx ? "border-primary/50 bg-primary/5" : idx < currentIdx ? "border-border" : "border-dashed border-border/60 opacity-70",
            )}
          >
            <div className="flex items-center gap-2">
              <StepBadge type={step.type} />
              <span className="font-medium">{step.title}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

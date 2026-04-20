import { useCallback, useEffect, useReducer, useRef } from "react";
import { PRESETS, type Preset } from "@/data/presets";

export type Mode = "mocked" | "live";
export type Speed = "slow" | "normal" | "instant";
export type Status = "idle" | "planning" | "running" | "paused" | "verified" | "failed";

export interface Settings {
  speed: Speed;
  autoAdvance: boolean;
  showReasoning: boolean;
}

export interface RunRecord {
  id: string;
  presetId: string;
  goal: string;
  finishedAt: number;
  finalAnswer: string;
  stepCount: number;
}

export interface PlaygroundState {
  selectedPresetId: string;
  goal: string;
  mode: Mode;
  apiKey: string;
  settings: Settings;
  currentStepIndex: number;
  status: Status;
  runHistory: RunRecord[];
  recentGoals: string[];
}

const STORAGE_KEY = "btp:playground:v1";

const DEFAULT: PlaygroundState = {
  selectedPresetId: PRESETS[0].id,
  goal: PRESETS[0].goal,
  mode: "mocked",
  apiKey: "",
  settings: { speed: "normal", autoAdvance: true, showReasoning: true },
  currentStepIndex: -1,
  status: "idle",
  runHistory: [],
  recentGoals: [],
};

type Action =
  | { type: "SET_PRESET"; presetId: string }
  | { type: "SET_GOAL"; goal: string }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_API_KEY"; apiKey: string }
  | { type: "SET_SETTINGS"; settings: Partial<Settings> }
  | { type: "SET_STEP"; index: number }
  | { type: "SET_STATUS"; status: Status }
  | { type: "FINISH_RUN"; record: RunRecord }
  | { type: "RESET_SESSION" }
  | { type: "REPLACE"; state: PlaygroundState };

function reducer(state: PlaygroundState, action: Action): PlaygroundState {
  switch (action.type) {
    case "SET_PRESET": {
      const preset = PRESETS.find((p) => p.id === action.presetId) ?? PRESETS[0];
      return { ...state, selectedPresetId: preset.id, goal: preset.goal, currentStepIndex: -1, status: "idle" };
    }
    case "SET_GOAL":
      return { ...state, goal: action.goal };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_API_KEY":
      return { ...state, apiKey: action.apiKey };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "SET_STEP":
      return { ...state, currentStepIndex: action.index };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "FINISH_RUN":
      return {
        ...state,
        runHistory: [action.record, ...state.runHistory].slice(0, 20),
        recentGoals: [action.record.goal, ...state.recentGoals.filter((g) => g !== action.record.goal)].slice(0, 8),
        status: "verified",
      };
    case "RESET_SESSION":
      return {
        ...DEFAULT,
        runHistory: state.runHistory,
        recentGoals: state.recentGoals,
        mode: state.mode,
        apiKey: state.apiKey,
        settings: state.settings,
      };
    case "REPLACE":
      return action.state;
  }
}

interface History {
  past: PlaygroundState[];
  future: PlaygroundState[];
}

export function usePlayground() {
  const [state, dispatch] = useReducer(reducer, DEFAULT);
  const historyRef = useRef<History>({ past: [], future: [] });
  const loadedRef = useRef(false);

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlaygroundState;
        dispatch({ type: "REPLACE", state: { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } } });
      }
    } catch {
      // ignore
    }
    loadedRef.current = true;
  }, []);

  // Persist
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const trackedDispatch = useCallback((action: Action, options?: { track?: boolean }) => {
    const track = options?.track ?? false;
    if (track) {
      historyRef.current.past.push(state);
      if (historyRef.current.past.length > 50) historyRef.current.past.shift();
      historyRef.current.future = [];
    }
    dispatch(action);
  }, [state]);

  const undo = useCallback(() => {
    const prev = historyRef.current.past.pop();
    if (!prev) return;
    historyRef.current.future.push(state);
    dispatch({ type: "REPLACE", state: prev });
  }, [state]);

  const redo = useCallback(() => {
    const next = historyRef.current.future.pop();
    if (!next) return;
    historyRef.current.past.push(state);
    dispatch({ type: "REPLACE", state: next });
  }, [state]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const preset: Preset = PRESETS.find((p) => p.id === state.selectedPresetId) ?? PRESETS[0];

  return {
    state,
    preset,
    dispatch: trackedDispatch,
    undo,
    redo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
  };
}

export type StepType = "GOAL" | "PLAN" | "ACTION" | "OBSERVATION" | "EXTRACTION" | "VERIFY";

export interface RunStep {
  id: string;
  type: StepType;
  title: string;
  detail: string;
  url?: string;
  pageHtml?: string;
  extracted?: Record<string, unknown> | Array<Record<string, unknown>>;
  verifyPass?: boolean;
}

export interface VerificationCheck {
  label: string;
  pass: boolean;
}

export interface Preset {
  id: string;
  name: string;
  emoji: string;
  goal: string;
  description: string;
  estimatedSteps: number;
  examplePrompts: string[];
  steps: RunStep[];
  finalAnswer: string;
  reasoning: string[];
  verification: VerificationCheck[];
}

export const PRESETS: Preset[] = [
  {
    id: "research",
    name: "Research a topic",
    emoji: "📚",
    goal: "Summarize how transformer attention works from 3 sources",
    description: "Plan a research path, visit sources, extract key ideas, and synthesize.",
    estimatedSteps: 8,
    examplePrompts: [
      "Cite each source explicitly",
      "Limit to 3 short bullets",
      "Compare scaled dot-product vs additive attention",
      "Find a beginner-friendly source",
    ],
    steps: [
      { id: "s1", type: "GOAL", title: "Goal received", detail: "Summarize how transformer attention works from 3 sources." },
      { id: "s2", type: "PLAN", title: "Draft research plan", detail: "1) Search definitions  2) Open 3 reputable sources  3) Extract core ideas  4) Cross-check  5) Synthesize." },
      { id: "s3", type: "ACTION", title: "Search the web", detail: "Query: 'transformer attention explained'", url: "https://search.example.com?q=transformer+attention", pageHtml: "<h3>Top results</h3><ul><li>Attention Is All You Need (paper)</li><li>The Illustrated Transformer</li><li>Stanford CS25 notes</li></ul>" },
      { id: "s4", type: "ACTION", title: "Open source 1", detail: "Navigate to the original paper.", url: "https://arxiv.example/1706.03762", pageHtml: "<h3>Attention Is All You Need</h3><p>Scaled dot-product: softmax(QKᵀ/√d)V. Multi-head attention runs h projections in parallel.</p>" },
      { id: "s5", type: "EXTRACTION", title: "Extract key formula", detail: "Pulled definition + formula.", extracted: { source: "arxiv 1706.03762", concept: "scaled dot-product attention", formula: "softmax(QKᵀ/√d)V" } },
      { id: "s6", type: "ACTION", title: "Open source 2", detail: "The Illustrated Transformer.", url: "https://jalammar.example/illustrated-transformer", pageHtml: "<h3>The Illustrated Transformer</h3><p>Attention lets each token look at every other token and weight their importance.</p>" },
      { id: "s7", type: "EXTRACTION", title: "Extract intuition", detail: "Pulled plain-language summary.", extracted: { source: "jalammar", intuition: "Each token attends to all others, weighted by relevance." } },
      { id: "s8", type: "OBSERVATION", title: "Cross-check", detail: "Both sources agree on the QKV mechanism. Adding a third for breadth." },
      { id: "s9", type: "ACTION", title: "Open source 3", detail: "Stanford CS25 notes.", url: "https://cs25.example/notes/attention", pageHtml: "<h3>CS25: Attention</h3><p>Multi-head attention enables the model to jointly attend to information from different representation subspaces.</p>" },
      { id: "s10", type: "EXTRACTION", title: "Extract multi-head idea", detail: "Pulled multi-head rationale.", extracted: { source: "stanford cs25", concept: "multi-head", why: "attend to different subspaces" } },
      { id: "s11", type: "VERIFY", title: "Verify coverage", detail: "All 3 sources cited; mechanism, intuition, and multi-head covered.", verifyPass: true },
    ],
    finalAnswer: "Transformer attention computes weighted relationships between tokens using softmax(QKᵀ/√d)V. Each token attends to every other token, weighted by relevance (Vaswani et al., 2017; Alammar; Stanford CS25). Multi-head attention runs this in parallel across subspaces so the model can capture different relationships simultaneously.",
    reasoning: [
      "Started with a broad search to identify reputable sources.",
      "Picked the original paper for the formal definition.",
      "Added an explanatory source for plain-language intuition.",
      "Used a course note to cover multi-head reasoning.",
      "Cross-checked claims before synthesis.",
    ],
    verification: [
      { label: "All 3 sources cited", pass: true },
      { label: "Mechanism + intuition covered", pass: true },
      { label: "Multi-head explained", pass: true },
    ],
  },
  {
    id: "compare-prices",
    name: "Compare product prices",
    emoji: "🛒",
    goal: "Compare price of a Logitech MX Master 3S across 3 stores",
    description: "Visit multiple stores, extract prices, and summarize differences.",
    estimatedSteps: 7,
    examplePrompts: [
      "Include shipping cost",
      "Find the cheapest option",
      "Flag any out-of-stock listings",
      "Compare warranty terms",
    ],
    steps: [
      { id: "s1", type: "GOAL", title: "Goal received", detail: "Compare price of MX Master 3S across 3 stores." },
      { id: "s2", type: "PLAN", title: "Draft plan", detail: "Search 3 retailers, extract price + stock, then compare." },
      { id: "s3", type: "ACTION", title: "Visit store A", detail: "Open store A product page.", url: "https://storea.example/mx-master-3s", pageHtml: "<h3>MX Master 3S</h3><p>Price: <b>$99.99</b> · In stock · Free shipping</p>" },
      { id: "s4", type: "EXTRACTION", title: "Extract from store A", detail: "Price + stock captured.", extracted: { store: "Store A", price: 99.99, stock: "in", shipping: 0 } },
      { id: "s5", type: "ACTION", title: "Visit store B", detail: "Open store B product page.", url: "https://storeb.example/p/mx-master-3s", pageHtml: "<h3>MX Master 3S</h3><p>Price: <b>$94.50</b> · Ships in 2 days · $5 shipping</p>" },
      { id: "s6", type: "EXTRACTION", title: "Extract from store B", detail: "Price + shipping captured.", extracted: { store: "Store B", price: 94.5, stock: "in", shipping: 5 } },
      { id: "s7", type: "ACTION", title: "Visit store C", detail: "Open store C product page.", url: "https://storec.example/items/mx3s", pageHtml: "<h3>MX Master 3S</h3><p>Price: <b>$109.00</b> · In stock · Free shipping</p>" },
      { id: "s8", type: "EXTRACTION", title: "Extract from store C", detail: "Price + stock captured.", extracted: { store: "Store C", price: 109.0, stock: "in", shipping: 0 } },
      { id: "s9", type: "OBSERVATION", title: "Compute totals", detail: "A=$99.99, B=$99.50 with shipping, C=$109.00." },
      { id: "s10", type: "VERIFY", title: "Verify ≥2 sources", detail: "3 stores compared, totals reconciled.", verifyPass: true },
    ],
    finalAnswer: "Best total price: Store A at $99.99 (free shipping). Store B is $94.50 + $5 shipping = $99.50 — slightly cheaper but ships in 2 days. Store C is the most expensive at $109.00.",
    reasoning: [
      "Selected 3 representative retailers.",
      "Captured both list price and shipping for fair comparison.",
      "Computed delivered totals before recommending.",
    ],
    verification: [
      { label: "Prices from ≥2 sites", pass: true },
      { label: "Shipping included in totals", pass: true },
      { label: "Stock status checked", pass: true },
    ],
  },
  {
    id: "extract-data",
    name: "Extract structured data",
    emoji: "📊",
    goal: "Pull all job listings from a careers page into a table",
    description: "Crawl a listings page, extract structured rows, normalize fields.",
    estimatedSteps: 6,
    examplePrompts: [
      "Filter by remote-only",
      "Group by department",
      "Add posting date",
      "Export as CSV",
    ],
    steps: [
      { id: "s1", type: "GOAL", title: "Goal received", detail: "Extract all job listings into a structured table." },
      { id: "s2", type: "PLAN", title: "Draft plan", detail: "Open careers page, identify list items, extract title/team/location, normalize." },
      { id: "s3", type: "ACTION", title: "Open careers page", detail: "Navigate to /careers.", url: "https://acme.example/careers", pageHtml: "<h3>Open roles</h3><ul><li>Senior Engineer · Platform · Remote</li><li>Product Designer · Design · Berlin</li><li>Data Analyst · Insights · Remote</li><li>PM, Growth · Product · NYC</li></ul>" },
      { id: "s4", type: "OBSERVATION", title: "Found 4 listings", detail: "Detected list pattern: title · team · location." },
      { id: "s5", type: "EXTRACTION", title: "Extract rows", detail: "Parsed all listings into structured rows.", extracted: [
        { title: "Senior Engineer", team: "Platform", location: "Remote" },
        { title: "Product Designer", team: "Design", location: "Berlin" },
        { title: "Data Analyst", team: "Insights", location: "Remote" },
        { title: "PM, Growth", team: "Product", location: "NYC" },
      ] },
      { id: "s6", type: "VERIFY", title: "Verify completeness", detail: "All 4 rows have title, team, location.", verifyPass: true },
    ],
    finalAnswer: "Extracted 4 open roles: Senior Engineer (Platform, Remote), Product Designer (Design, Berlin), Data Analyst (Insights, Remote), PM Growth (Product, NYC).",
    reasoning: [
      "Detected a repeating list pattern on the page.",
      "Used consistent field order to parse rows.",
      "Verified every row has all required fields.",
    ],
    verification: [
      { label: "All rows extracted", pass: true },
      { label: "Fields normalized", pass: true },
      { label: "No nulls in required columns", pass: true },
    ],
  },
  {
    id: "multi-step-form",
    name: "Multi-step form with approval",
    emoji: "📝",
    goal: "Book a demo: fill form across steps, pause for approval before submit",
    description: "Fill a multi-step form, checkpoint before submission.",
    estimatedSteps: 7,
    examplePrompts: [
      "Use my work email",
      "Pick the earliest slot",
      "Skip the marketing opt-in",
      "Add a note about team size",
    ],
    steps: [
      { id: "s1", type: "GOAL", title: "Goal received", detail: "Book a demo with checkpointed approval." },
      { id: "s2", type: "PLAN", title: "Draft plan", detail: "Step 1: contact  Step 2: company  Step 3: schedule  Pause for approval  Submit." },
      { id: "s3", type: "ACTION", title: "Step 1 — contact", detail: "Filled name + work email.", url: "https://demo.example/book?step=1", pageHtml: "<h3>Step 1 of 3</h3><p>Name: Alex Doe<br/>Email: alex@acme.com</p>" },
      { id: "s4", type: "ACTION", title: "Step 2 — company", detail: "Filled company + team size.", url: "https://demo.example/book?step=2", pageHtml: "<h3>Step 2 of 3</h3><p>Company: Acme<br/>Team size: 25</p>" },
      { id: "s5", type: "ACTION", title: "Step 3 — schedule", detail: "Picked earliest slot.", url: "https://demo.example/book?step=3", pageHtml: "<h3>Step 3 of 3</h3><p>Slot: Thu 10:00</p>" },
      { id: "s6", type: "OBSERVATION", title: "Approval checkpoint", detail: "Pausing — needs human approval before final submit." },
      { id: "s7", type: "ACTION", title: "Submit form", detail: "Approved. Submitted.", url: "https://demo.example/book/confirm", pageHtml: "<h3>✅ Demo booked</h3><p>Confirmation #DM-2048 sent to alex@acme.com.</p>" },
      { id: "s8", type: "EXTRACTION", title: "Extract confirmation", detail: "Captured confirmation ID.", extracted: { confirmationId: "DM-2048", slot: "Thu 10:00", email: "alex@acme.com" } },
      { id: "s9", type: "VERIFY", title: "Verify booking", detail: "Confirmation page reached and ID captured.", verifyPass: true },
    ],
    finalAnswer: "Demo booked for Thursday 10:00. Confirmation DM-2048 sent to alex@acme.com.",
    reasoning: [
      "Filled the form in 3 logical steps.",
      "Paused before submission for explicit approval.",
      "Captured the confirmation ID for traceability.",
    ],
    verification: [
      { label: "All required fields filled", pass: true },
      { label: "Approval checkpoint respected", pass: true },
      { label: "Confirmation captured", pass: true },
    ],
  },
];

export const STEP_EXPLANATIONS: Record<StepType, string> = {
  GOAL: "The goal is what the user wants. Everything the agent does should serve this goal.",
  PLAN: "Planning is the agent breaking the goal into smaller, ordered steps before acting.",
  ACTION: "An action is a concrete browser operation: navigate, click, type, scroll.",
  OBSERVATION: "Observation is the agent reading what changed on the page after an action.",
  EXTRACTION: "Extraction pulls structured data (text, numbers, lists) out of a page.",
  VERIFY: "Verification checks the final result against the original goal before finishing.",
};

export function getPreset(id: string | null | undefined): Preset | undefined {
  if (!id) return undefined;
  return PRESETS.find((p) => p.id === id);
}

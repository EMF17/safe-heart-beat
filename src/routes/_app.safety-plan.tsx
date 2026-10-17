import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ListChecks, Sparkles, Check } from "lucide-react";
import { generateSafetyChecklist, type ChecklistSection } from "@/lib/checklist.functions";

const STORE_KEY = "pulse:safetyChecklist";

interface Saved {
  summary: string;
  sections: ChecklistSection[];
  done: Record<string, boolean>;
  situation: string;
  region: string;
}

export const Route = createFileRoute("/_app/safety-plan")({
  component: SafetyPlanPage,
  head: () => ({
    meta: [
      { title: "Personal Safety Checklist — Pulse" },
      {
        name: "description",
        content: "Get an AI-powered safety-preparedness checklist tailored to living alone in your region.",
      },
      { property: "og:title", content: "Personal Safety Checklist — Pulse" },
      {
        property: "og:description",
        content: "Describe your home and region; Pulse builds a personalized preparedness checklist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SafetyPlanPage() {
  const generate = useServerFn(generateSafetyChecklist);
  const [situation, setSituation] = useState("");
  const [region, setRegion] = useState("");
  const [plan, setPlan] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        setPlan(s);
        setSituation(s.situation);
        setRegion(s.region);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const save = (s: Saved | null) => {
    setPlan(s);
    if (s) localStorage.setItem(STORE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORE_KEY);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await generate({ data: { situation, region } });
      save({ ...res, done: {}, situation, region });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (key: string) => {
    if (!plan) return;
    save({ ...plan, done: { ...plan.done, [key]: !plan.done[key] } });
  };

  const total = plan?.sections.reduce((n, s) => n + s.items.length, 0) ?? 0;
  const completed = plan ? Object.values(plan.done).filter(Boolean).length : 0;

  return (
    <div className="px-5 pt-6 pb-28 max-w-xl mx-auto">
      <Link to="/settings" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Settings
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <ListChecks className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold">Your safety checklist</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Tell us a little about how you live. AI will suggest a preparedness checklist made for you.
        Avoid names or addresses — only what helps the advice.
      </p>

      <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
        <label className="block text-xs text-muted-foreground">
          Your living situation
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            maxLength={1500}
            rows={4}
            placeholder="e.g. I'm 72, live alone in a 3rd-floor flat with no lift, have mild asthma and a cat."
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Region
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            maxLength={120}
            placeholder="e.g. Hong Kong, or rural Queensland, Australia"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          onClick={submit}
          disabled={busy || situation.trim().length < 10 || region.trim().length < 2}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium py-2.5 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {busy ? "Creating your checklist…" : plan ? "Create a new checklist" : "Create my checklist"}
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {plan && (
        <div className="mt-6">
          <p className="text-sm">{plan.summary}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {completed} of {total} done
          </p>
          {plan.sections.map((s, si) => (
            <section key={si} className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] mb-2">{s.title}</h2>
              <ul className="space-y-2">
                {s.items.map((it, ii) => {
                  const key = `${si}-${ii}`;
                  const done = !!plan.done[key];
                  return (
                    <li key={key}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full text-left flex gap-3 bg-card border border-border/60 rounded-xl p-3"
                      >
                        <span
                          className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${done ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                        >
                          {done && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span>
                          <span className={`block text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                            {it.task}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{it.why}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <p className="text-[11px] text-muted-foreground mt-6">
            AI suggestions are general guidance, not professional advice. In an emergency, call your
            local emergency number.
          </p>
        </div>
      )}
    </div>
  );
}

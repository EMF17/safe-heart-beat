import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, History, TrendingUp, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

const CHECKINS_KEY = "pulse:checkins";

interface CheckinRecord {
  timestamp: number;
}

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "History — Pulse" },
      { name: "description", content: "View your Pulse check-in history and streaks." },
    ],
  }),
});

function HistoryPage() {
  const [checkins, setCheckins] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(CHECKINS_KEY);
    if (raw) {
      try {
        const parsed: number[] = JSON.parse(raw);
        setCheckins(parsed.sort((a, b) => b - a));
      } catch {}
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return <div className="min-h-full" />;

  const stats = calculateStreaks(checkins);

  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          History
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 leading-tight">
          Your check-ins
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-8">
          Every tap is a promise kept.
        </p>

        {/* Summary Cards */}
        {checkins.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <SummaryCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Current streak"
              value={`${stats.currentStreak} days`}
            />
            <SummaryCard
              icon={<Award className="w-4 h-4" />}
              label="Best streak"
              value={`${stats.bestStreak} days`}
            />
            <SummaryCard
              icon={<Calendar className="w-4 h-4" />}
              label="Total check-ins"
              value={`${checkins.length}`}
            />
          </div>
        )}

        {/* Check-in List */}
        {checkins.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <History className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              No check-ins yet. Tap the button to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Last {Math.min(30, checkins.length)} check-ins
            </p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {checkins.slice(0, 30).map((ts, i) => (
                <CheckinCard key={`${ts}-${i}`} timestamp={ts} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

function CheckinCard({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp);
  return (
    <div className="flex items-center justify-between bg-card border border-border/60 rounded-2xl px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">
          {format(date, "MMMM d, yyyy")}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(date, "h:mm a")}
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        Check-in recorded
      </div>
    </div>
  );
}

function calculateStreaks(checkins: number[]): {
  currentStreak: number;
  bestStreak: number;
} {
  if (checkins.length === 0) return { currentStreak: 0, bestStreak: 0 };

  // Get unique dates (YYYY-MM-DD strings), sorted newest first
  const uniqueDates = Array.from(
    new Set(checkins.map((ts) => format(new Date(ts), "yyyy-MM-dd")))
  ).sort((a, b) => b.localeCompare(a));

  // Current streak: count consecutive days from today backwards
  const today = format(new Date(), "yyyy-MM-dd");
  let currentStreak = 0;

  if (uniqueDates[0] === today) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diff = Math.round(
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (uniqueDates.length > 0) {
    // Check if the most recent check-in was yesterday (still counts as active streak)
    const mostRecent = new Date(uniqueDates[0]);
    const todayDate = new Date(today);
    const diff = Math.round(
      (todayDate.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const dayDiff = Math.round(
          (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Best streak: find longest consecutive run
  let bestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      currentRun++;
      bestStreak = Math.max(bestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  return { currentStreak, bestStreak };
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Phone,
  Copy,
  X,
  ArrowLeft,
  Earth,
} from "lucide-react";
import { emergencyNumbers, type EmergencyService } from "@/lib/emergency-numbers";

export const Route = createFileRoute("/_app/emergency-numbers")({
  component: EmergencyNumbersPage,
  head: () => ({
    meta: [
      { title: "Emergency Numbers — Pulse" },
      {
        name: "description",
        content:
          "Offline worldwide emergency numbers for Pulse. No internet required.",
      },
    ],
  }),
});

function EmergencyNumbersPage() {
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return emergencyNumbers;
    return emergencyNumbers.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.services.some(
          (s) =>
            s.number.includes(q) || s.label.toLowerCase().includes(q),
        ),
    );
  }, [query]);

  const handleCopy = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback: do nothing on unsupported platforms
    }
  };

  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/settings"
            className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground"
            aria-label="Back to settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Resources
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
              Emergency Numbers
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or number"
            className="w-full h-11 pl-10 pr-9 rounded-full bg-card border border-border/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3 mb-6">
          {filtered.map((country) => (
            <div
              key={country.code}
              className="bg-card border border-border/60 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl" aria-hidden>
                  {country.flag}
                </span>
                <h2 className="font-medium text-sm">{country.country}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {country.services.map((service) => (
                  <button
                    key={service.label}
                    onClick={() => setSelectedService(service)}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border/60 text-sm hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    aria-label={`${service.label}: ${service.number}`}
                  >
                    <span className="text-muted-foreground text-xs">
                      {service.label}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {service.number}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Earth className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No countries match your search.</p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-4">
          Emergency numbers are stored locally on your device. No data is sent
          anywhere.
        </p>
      </div>

      {/* Action sheet */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="w-full md:max-w-sm bg-card border-t md:border border-border rounded-t-3xl md:rounded-3xl p-6 shadow-[var(--shadow-soft)] animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mb-1">
                {selectedService.label}
              </p>
              <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                {selectedService.number}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`tel:${selectedService.number}`}
                className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition"
                onClick={() => setSelectedService(null)}
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <button
                onClick={() => {
                  handleCopy(selectedService.number);
                }}
                className="flex-1 h-12 rounded-full border-2 border-primary text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/10 active:scale-[0.98] transition"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="w-full mt-3 h-11 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

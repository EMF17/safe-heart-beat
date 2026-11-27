const CHECKED_ON = "23 November 2026";
const SNUG_SOURCE = "https://snug.helpscoutdocs.com/article/61-snug-pricing";

// Advance CHECKED_ON only after opening and rechecking the linked sources.
const rows = [
  { feature: "Price", pulse: "Free", snug: "Free plan; paid options" },
  { feature: "Check-in schedule", pulse: "24, 48 or 72 hours", snug: "One daily check-in on free plan" },
  { feature: "Missed-check-in alerts", pulse: "Email to a confirmed contact; delivery not guaranteed", snug: "SMS to contacts on free plan; dispatcher follow-up on paid Dispatch plan" },
];

export function CompetitorComparison() {
  return (
    <>
      <div className="mt-6 overflow-x-auto border border-border/60 bg-card rounded-lg">
        <table className="w-full min-w-[440px] text-xs sm:text-sm">
          <caption className="sr-only">Pulse and Snug: published product information checked on {CHECKED_ON}</caption>
          <thead>
            <tr className="border-b border-border/60 text-left">
              <th scope="col" className="px-3 py-3 sm:p-4 font-medium">Feature</th>
              <th scope="col" className="px-3 py-3 sm:p-4 font-semibold text-primary">Pulse</th>
              <th scope="col" className="px-3 py-3 sm:p-4 font-medium">Snug</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-border/40 last:border-0 align-top">
                <th scope="row" className="px-3 py-3 sm:p-4 text-left font-normal text-muted-foreground">{row.feature}</th>
                <td className="px-3 py-3 sm:p-4 font-medium">{row.pulse}</td>
                <td className="px-3 py-3 sm:p-4 text-muted-foreground">{row.snug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Sources checked as of <time dateTime="2026-11-23">{CHECKED_ON}</time>. This is a dated snapshot, not a live comparison; features, pricing and availability may change by region.
        </p>
        <p>
          Snug details above are from its official <a href={SNUG_SOURCE} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">plans and pricing page</a>. We have not independently tested its service.
        </p>
        <p>Check each provider’s current terms before choosing a safety service.</p>
      </div>
    </>
  );
}
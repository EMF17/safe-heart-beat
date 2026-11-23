const CHECKED_ON = "23 November 2026";
const SNUG_SOURCE = "https://snug.helpscoutdocs.com/article/61-snug-pricing";
const DEMUMU_SOURCE = "https://www.channelnewsasia.com/asia/china-viral-app-are-you-dead-name-change-download-spike-5854966";

// Advance CHECKED_ON only after opening and rechecking the linked sources.
// Historical reporting is not evidence of Demumu's current product features.
const rows = [
  { feature: "Price", pulse: "Free", demumu: "Not verified", snug: "Free plan; paid options" },
  { feature: "Check-in schedule", pulse: "24, 48 or 72 hours", demumu: "Not verified", snug: "One daily check-in on free plan" },
  { feature: "Missed-check-in alerts", pulse: "Email to a confirmed contact; delivery not guaranteed", demumu: "Not verified", snug: "SMS to contacts on free plan; dispatcher follow-up on paid Dispatch plan" },
];

export function CompetitorComparison({ includeSnug = true }: { includeSnug?: boolean }) {
  return (
    <>
      <div className="mt-6 overflow-x-auto border border-border/60 bg-card rounded-lg">
        <table className="w-full min-w-[440px] text-xs sm:text-sm">
          <caption className="sr-only">Published product information checked on {CHECKED_ON}; Demumu current details not verified</caption>
          <thead>
            <tr className="border-b border-border/60 text-left">
              <th scope="col" className="px-3 py-3 sm:p-4 font-medium">Feature</th>
              <th scope="col" className="px-3 py-3 sm:p-4 font-semibold text-primary">Pulse</th>
              <th scope="col" className="px-3 py-3 sm:p-4 font-medium">Demumu</th>
              {includeSnug && <th scope="col" className="px-3 py-3 sm:p-4 font-medium">Snug</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-border/40 last:border-0 align-top">
                <th scope="row" className="px-3 py-3 sm:p-4 text-left font-normal text-muted-foreground">{row.feature}</th>
                <td className="px-3 py-3 sm:p-4 font-medium">{row.pulse}</td>
                <td className="px-3 py-3 sm:p-4 text-muted-foreground">{row.demumu}</td>
                {includeSnug && <td className="px-3 py-3 sm:p-4 text-muted-foreground">{row.snug}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          Sources checked as of <time dateTime="2026-11-23">{CHECKED_ON}</time>. This is a dated snapshot, not a live comparison; features, pricing and availability may change by region.
        </p>
        {includeSnug && <p>
          Snug details above are from its official <a href={SNUG_SOURCE} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">plans and pricing page</a>. We have not independently tested its service.
        </p>}
        <p>
          Demumu’s current pricing and features could not be verified from a current official source, so we make no current feature claims. <a href={DEMUMU_SOURCE} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">CNA’s report published on 13 January 2026</a> described it as “Are You Dead?” outside China under the name Demumu, with daily check-ins and email notification after more than two missed days. That is historical reporting, not confirmation of its features today.
        </p>
        <p>Unverified does not mean a feature is unavailable. Check each provider’s current terms before choosing a safety service.</p>
      </div>
    </>
  );
}
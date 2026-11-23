/**
 * Contact names appear in alert emails/texts, so strip anything that could
 * turn them into an advert: links, email addresses, domains, digits runs and
 * symbols. Letters (any script), spaces, apostrophes, hyphens and dots remain.
 */
export function safeContactName(raw: string | null | undefined): string {
  let s = (raw ?? "").normalize("NFKC");
  s = s.replace(/\S+@\S+/g, " ")
    .replace(/(https?:\/\/|www\.)\S*/gi, " ")
    .replace(/\b[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)*\.(com|net|org|io|app|co|xyz|info|biz|me|ly|hk|cn|uk|us|ru|top|site|online|link|shop|club)\b\S*/giu, " ")
    .replace(/[^\p{L}\p{M}\s'’.-]/gu, " ")
    .replace(/\s+/g, " ").trim().slice(0, 40).trim();
  return s || "Your contact";
}

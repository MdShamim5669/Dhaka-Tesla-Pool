/**
 * Converts integer paisa to BDT currency string
 * e.g., 8320 paisa -> "৳83.20"
 */
export function formatPaisaToBDT(paisa: number): string {
  const bdt = (paisa / 100).toFixed(2);
  return `৳${bdt}`;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

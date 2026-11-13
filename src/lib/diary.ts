export const DIARY_PAGE_SIZE = 10;

/**
 * Appends incoming entries to an existing list while skipping duplicate IDs so
 * concurrent inserts never introduce duplicate cards or React keys.
 */
export function dedupeById<T extends { id: string }>(
  existing: T[],
  incoming: T[]
): T[] {
  if (incoming.length === 0) return existing;

  const seen = new Set(existing.map((item) => item.id));
  const uniqueAdditions: T[] = [];

  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueAdditions.push(item);
    }
  }

  return uniqueAdditions.length > 0 ? [...existing, ...uniqueAdditions] : existing;
}

/**
 * Merges and sorts distinct integer years descending.
 */
export function mergeSortedYearsDesc(
  ...yearLists: ReadonlyArray<ReadonlyArray<number | null | undefined>>
): number[] {
  const years = new Set<number>();
  for (const list of yearLists) {
    for (const year of list) {
      if (typeof year === "number" && Number.isInteger(year)) {
        years.add(year);
      }
    }
  }
  return Array.from(years).sort((a, b) => b - a);
}

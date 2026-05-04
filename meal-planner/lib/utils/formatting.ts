// ── formatCurrency ────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// ── formatDate ────────────────────────────────────────────────────────────────

/**
 * Formats a date as "Mon, Jan 15".
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ── formatShortDate ───────────────────────────────────────────────────────────

/**
 * Formats a date as "Jan 15".
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── getDayName ────────────────────────────────────────────────────────────────

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Returns the full day name for a 0-indexed day-of-week number (0 = Sunday).
 */
export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[((dayOfWeek % 7) + 7) % 7];
}

// ── getWeekStart ──────────────────────────────────────────────────────────────

/**
 * Returns the ISO date string (YYYY-MM-DD) of the Monday of the week
 * containing `date` (or today if omitted).
 */
export function getWeekStart(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// ── getWeekEnd ────────────────────────────────────────────────────────────────

/**
 * Returns the ISO date string (YYYY-MM-DD) of the Sunday of the week
 * containing `date` (or today if omitted).
 */
export function getWeekEnd(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// ── capitalizeFirst ───────────────────────────────────────────────────────────

export function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── formatUnit ────────────────────────────────────────────────────────────────

/**
 * Produces a human-readable quantity + unit string such as "2 cups" or "100g".
 * Drops the space for metric abbreviations (g, kg, ml, l).
 */
export function formatUnit(qty: number, unit: string): string {
  const noSpace = ['g', 'kg', 'ml', 'l'].includes(unit.toLowerCase().trim());
  const qtyStr = Number.isInteger(qty)
    ? String(qty)
    : qty.toFixed(2).replace(/\.?0+$/, '');
  return noSpace ? `${qtyStr}${unit}` : `${qtyStr} ${unit}`;
}

// ── formatNutrient ────────────────────────────────────────────────────────────

/**
 * Formats a nutrient value with its unit, e.g. "32g" or "250 kcal".
 */
export function formatNutrient(value: number, unit: string): string {
  const rounded = Math.round(value);
  const noSpace = ['g', 'mg', 'mcg', '%'].includes(unit.toLowerCase().trim());
  return noSpace ? `${rounded}${unit}` : `${rounded} ${unit}`;
}

// ── truncate ──────────────────────────────────────────────────────────────────

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

// ── slugify ───────────────────────────────────────────────────────────────────

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── isValidEmail ──────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  // RFC 5322-inspired, practical regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── isValidZipCode ────────────────────────────────────────────────────────────

/**
 * Validates US ZIP codes (5-digit or ZIP+4).
 */
export function isValidZipCode(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip.trim());
}

// ── isPositiveNumber ──────────────────────────────────────────────────────────

export function isPositiveNumber(n: unknown): n is number {
  return typeof n === 'number' && isFinite(n) && n > 0;
}

// ── validatePantryItem ────────────────────────────────────────────────────────

type PantryItemInput = {
  ingredient_name?: unknown;
  quantity?: unknown;
  unit?: unknown;
  category?: unknown;
  expires_at?: unknown;
};

export function validatePantryItem(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Invalid payload: expected an object'] };
  }

  const d = data as PantryItemInput;

  if (
    typeof d.ingredient_name !== 'string' ||
    d.ingredient_name.trim().length === 0
  ) {
    errors.push('ingredient_name is required and must be a non-empty string');
  }

  if (typeof d.quantity !== 'number' || !isFinite(d.quantity) || d.quantity < 0) {
    errors.push('quantity must be a non-negative number');
  }

  if (d.unit != null && typeof d.unit !== 'string') {
    errors.push('unit must be a string');
  }

  if (d.category != null && typeof d.category !== 'string') {
    errors.push('category must be a string');
  }

  if (d.expires_at != null) {
    if (typeof d.expires_at !== 'string') {
      errors.push('expires_at must be an ISO date string');
    } else {
      const date = new Date(d.expires_at);
      if (isNaN(date.getTime())) {
        errors.push('expires_at must be a valid ISO date string');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── validateDietaryPreferences ────────────────────────────────────────────────

type DietaryPreferencesInput = {
  vegan?: unknown;
  keto?: unknown;
  glutenFree?: unknown;
  dairyFree?: unknown;
  nutFree?: unknown;
};

export function validateDietaryPreferences(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: ['Invalid payload: expected an object'],
    };
  }

  const d = data as DietaryPreferencesInput;
  const boolFields = [
    'vegan',
    'keto',
    'glutenFree',
    'dairyFree',
    'nutFree',
  ] as const;

  for (const field of boolFields) {
    if (d[field] != null && typeof d[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── sanitizeText ──────────────────────────────────────────────────────────────

/**
 * Trims the string and strips all HTML tags.
 */
export function sanitizeText(s: string): string {
  return s.trim().replace(/<[^>]*>/g, '');
}

/**
 * Utility helpers for player-related data.
 */

/**
 * Return up to two initials for a player's name. If the name contains
 * multiple words, the first character of the first two words are used.
 * Otherwise the first two characters of the name are returned.
 */
export function getInitials(name: string): string {
  if (!name) {
    return '';
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[1][0]).toUpperCase();
}


/**
 * Formats a date string in ISO format (YYYY-MM-DD) to Norwegian format (DD.MM.YYYY)
 * @param dateString - Date string in YYYY-MM-DD format
 * @param locale - Locale to use for formatting (defaults to 'no-NO')
 * @returns Formatted date string in Norwegian format
 */
export function formatDateToNorwegian(
  dateString: string | undefined,
  locale: string = 'no-NO',
): string | undefined {
  if (!dateString) {
    return undefined;
  }

  try {
    // Parse the date string (assumes YYYY-MM-DD format)
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }

    // Format to Norwegian locale (DD.MM.YYYY)
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString; // Return original if error occurs
  }
}

/**
 * Formats a date string to Norwegian format with month name
 * @param dateString - Date string in YYYY-MM-DD format
 * @param locale - Locale to use for formatting (defaults to 'no-NO')
 * @returns Formatted date string with month name (e.g., "2. mai 2024")
 */
export function formatDateToNorwegianWithMonthName(
  dateString: string | undefined,
  locale: string = 'no-NO',
): string | undefined {
  if (!dateString) {
    return undefined;
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    // Format with month name
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString;
  }
}
